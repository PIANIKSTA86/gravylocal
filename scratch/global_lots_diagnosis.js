const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare(`
  SELECT 
    p.id as prod_id,
    p.code,
    p.name,
    p.track_lots,
    p.track_pallets,
    l.id as lot_id,
    l.lot_number,
    l.warehouse_id,
    l.initial_qty as lot_init,
    l.qty_on_hand as lot_on_hand,
    l.status as lot_status,
    w.name as wh_name,
    COALESCE(s.qty_on_hand, 0) as wh_stock
  FROM inventory_lots l
  JOIN products p ON l.product_id = p.id
  LEFT JOIN warehouses w ON l.warehouse_id = w.id
  LEFT JOIN inventory_stock s ON s.product_id = p.id AND s.warehouse_id = l.warehouse_id
  ORDER BY p.code, l.lot_number
`).all();

console.log('--- REPORTE COMPARATIVO: STOCK EN BODEGA VS STOCK EN LOTES ---');
for (const r of rows) {
  console.log(`[${r.code}] ${r.name}`);
  console.log(`  Bodega: ${r.wh_name} | Stock Real Bodega: ${r.wh_stock}`);
  console.log(`  Lote: ${r.lot_number} | Init: ${r.lot_init} | Lote On Hand: ${r.lot_on_hand} | Status: ${r.lot_status}`);
  console.log(`  TrackLots: ${r.track_lots} | TrackPallets: ${r.track_pallets}`);
  console.log(`  Discrepancia (Lote - Stock): ${r.lot_on_hand - r.wh_stock}\n`);
}

// Check pallets summary
const pltRows = db.prepare(`
  SELECT p.code, count(pl.id) as total_pallets, sum(pl.units_available) as total_units_pallets, pl.status
  FROM inventory_pallets pl
  JOIN products p ON pl.product_id = p.id
  GROUP BY p.code, pl.status
`).all();
console.log('--- RESUMEN DE ESTIBAS (PALLETS) ---');
console.log(JSON.stringify(pltRows, null, 2));
