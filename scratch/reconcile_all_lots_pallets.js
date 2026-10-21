const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

console.log('=== INICIANDO SANEAMIENTO Y RECONCILIACIÓN GLOBAL DE LOTES Y ESTIBAS ===');

db.exec('BEGIN TRANSACTION');

try {
  // 1. Activar flags track_lots y track_pallets en todos los productos que tengan registros en inventory_lots o inventory_pallets
  const prodsToActivate = db.prepare(`
    SELECT DISTINCT product_id FROM inventory_lots
    UNION
    SELECT DISTINCT product_id FROM inventory_pallets
  `).all().map(r => r.product_id);

  console.log(`\n1. Activando track_lots y track_pallets en ${prodsToActivate.length} productos...`);
  const updateProdStmt = db.prepare('UPDATE products SET track_lots = 1, track_pallets = 1 WHERE id = ?');
  for (const pid of prodsToActivate) {
    updateProdStmt.run(pid);
    const p = db.prepare('SELECT code, name FROM products WHERE id = ?').get(pid);
    console.log(`   - Producto [${p.code}] ${p.name} -> flags activados.`);
  }

  // 2. Obtener todos los productos afectados con sus lotes, estibas y stock en bodega
  const products = db.prepare(`
    SELECT DISTINCT p.id, p.code, p.name
    FROM products p
    JOIN inventory_lots l ON l.product_id = p.id
  `).all();

  for (const p of products) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`Procesando Producto: [${p.code}] ${p.name}`);

    // Obtener lotes del producto
    const lots = db.prepare(`
      SELECT * FROM inventory_lots WHERE product_id = ? ORDER BY created ASC
    `).all(p.id);

    // Obtener stock real consolidado de la bodega en inventory_stock
    const stockRow = db.prepare(`
      SELECT warehouse_id, qty_on_hand FROM inventory_stock WHERE product_id = ?
    `).get(p.id);

    const whId = lots[0]?.warehouse_id || stockRow?.warehouse_id;
    const realWhStock = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;

    console.log(`   Bodega: ${whId} | Stock Real en Kardex: ${realWhStock}`);

    // Calcular la cantidad inicial real importada para cada lote desde import_lot_configs o import_lines
    let totalInitialImported = 0;
    for (const lot of lots) {
      // Buscar en import_lot_configs
      let trueInitQty = Number(lot.initial_qty || 0);
      const lotCfg = db.prepare(`
        SELECT qty FROM import_lot_configs WHERE product_id = ? AND lot_number = ?
      `).get(p.id, lot.lot_number);

      if (lotCfg && Number(lotCfg.qty) > 0) {
        trueInitQty = Number(lotCfg.qty);
      } else {
        const impLine = db.prepare(`
          SELECT qty FROM import_lines WHERE product_id = ? AND lot_number = ?
        `).get(p.id, lot.lot_number);
        if (impLine && Number(impLine.qty) > 0) {
          trueInitQty = Number(impLine.qty);
        }
      }
      lot.trueInitQty = trueInitQty;
      totalInitialImported += trueInitQty;
    }

    console.log(`   Total Inicial Importado Real: ${totalInitialImported}`);
    const totalSold = Math.max(0, totalInitialImported - realWhStock);
    console.log(`   Total Vendido Acumulado: ${totalSold}`);

    // Distribuir el stock real restante entre los lotes en orden FEFO / FIFO
    let remainingStockToAssign = realWhStock;
    for (const lot of lots) {
      const assignedQty = Math.min(lot.trueInitQty, Math.max(0, remainingStockToAssign));
      remainingStockToAssign -= assignedQty;

      const lotStatus = assignedQty <= 0 ? 'depleted' : 'active';
      db.prepare(`
        UPDATE inventory_lots 
        SET initial_qty = ?, qty_on_hand = ?, status = ?, updated = datetime('now')
        WHERE id = ?
      `).run(lot.trueInitQty, assignedQty, lotStatus, lot.id);

      console.log(`   * LOTE [${lot.lot_number}]: Init = ${lot.trueInitQty} | QtyOnHand = ${assignedQty} | Status = ${lotStatus}`);
    }

    // Sincronizar las estibas (pallets) del producto
    const pallets = db.prepare(`
      SELECT * FROM inventory_pallets WHERE product_id = ? ORDER BY pallet_code ASC, created ASC
    `).all(p.id);

    if (pallets.length > 0) {
      console.log(`   Sincronizando ${pallets.length} estibas para este producto...`);
      let remainingUnitsForPallets = realWhStock;

      for (const plt of pallets) {
        const uPerBox = Number(plt.units_per_box || 1.44);
        const bInit = Number(plt.boxes_initial || 40);
        const maxCapacity = bInit * uPerBox;

        let curUnits = 0;
        let curBoxes = 0;
        let pltStatus = 'depleted';

        if (remainingUnitsForPallets >= maxCapacity) {
          curUnits = maxCapacity;
          curBoxes = bInit;
          pltStatus = 'full';
          remainingUnitsForPallets -= maxCapacity;
        } else if (remainingUnitsForPallets > 0) {
          curUnits = Math.round(remainingUnitsForPallets * 100) / 100;
          curBoxes = Math.ceil(curUnits / uPerBox);
          pltStatus = 'partial';
          remainingUnitsForPallets = 0;
        } else {
          curUnits = 0;
          curBoxes = 0;
          pltStatus = 'depleted';
        }

        db.prepare(`
          UPDATE inventory_pallets 
          SET units_available = ?, boxes_current = ?, status = ?, updated = datetime('now')
          WHERE id = ?
        `).run(curUnits, curBoxes, pltStatus, plt.id);
      }

      const summaryPallets = db.prepare(`
        SELECT status, count(*) as count, sum(units_available) as units
        FROM inventory_pallets WHERE product_id = ? GROUP BY status
      `).all(p.id);
      console.log(`   Resumen Estibas Actualizado:`, JSON.stringify(summaryPallets));
    }
  }

  // 3. Vincular los movimientos de venta de IMP-93 con los lotes correspondientes
  console.log('\n3. Vinculando lotes a movimientos de salida por venta huérfanos...');
  const saleMovs = db.prepare(`
    SELECT ml.id, ml.product_id, ml.qty, m.warehouse_id, m.number
    FROM inventory_movement_lines ml
    JOIN inventory_movements m ON ml.movement_id = m.id
    WHERE m.mov_type = 'SALIDA' AND (ml.lot_id IS NULL OR ml.lot_id = '')
  `).all();

  for (const sm of saleMovs) {
    const matchingLot = db.prepare(`
      SELECT id, lot_number FROM inventory_lots 
      WHERE product_id = ? AND warehouse_id = ?
      LIMIT 1
    `).get(sm.product_id, sm.warehouse_id);

    if (matchingLot) {
      db.prepare(`
        UPDATE inventory_movement_lines 
        SET lot_id = ?, lot_number = ?
        WHERE id = sm.id
      `).run(matchingLot.id, matchingLot.lot_number);
    }
  }

  db.exec('COMMIT');
  console.log('\n=== RECONCILIACIÓN COMPLETADA CON ÉXITO ===');
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Error durante la reconciliación:', err);
  process.exit(1);
}
