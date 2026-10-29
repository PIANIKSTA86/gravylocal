/**
 * Saneamiento y Conciliación de Depreciación - Puerto 8090 (DOMESTIKO SAS)
 * Restaura los 21 activos fijos a sus saldos iniciales exactos según apertura contable (AP-00000003 a 2025-12-31).
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  console.log('=== SANEAMIENTO DE ACTIVOS FIJOS PUERTO 8090 ===');
  console.log('Base de datos:', dbPath);

  // 1. Obtener todos los activos
  const assets = await query('SELECT id, code, name, cost, initial_depreciation_niif, accumulated_depreciation_niif, initial_depreciation_fiscal, accumulated_depreciation_fiscal, last_depreciation_period, purchase_date, is_depreciable FROM niif_assets ORDER BY code');

  console.log(`Analizando ${assets.length} activos...`);

  let restoredPrior2026 = 0;
  let restoredFuture2026 = 0;

  await run('BEGIN TRANSACTION');

  try {
    for (const a of assets) {
      const purchDate = String(a.purchase_date || '').trim();
      const isFuture2026 = purchDate.startsWith('2026-');

      if (isFuture2026) {
        // Activos comprados en 2026 (febrero, mayo, junio):
        // Acumulados a $0 y last_depreciation_period vacío ('') para que inicien en su mes correspondiente
        await run(`
          UPDATE niif_assets
          SET accumulated_depreciation_niif = 0,
              accumulated_depreciation_fiscal = 0,
              last_depreciation_period = ''
          WHERE id = ?
        `, [a.id]);
        restoredFuture2026++;
        console.log(`[Compra 2026] ${a.code} - ${a.name} -> Acum: $0, LastPeriod: '' (Compra: ${purchDate})`);
      } else {
        // Activos adquiridos antes de 2026:
        // Acumulado = Saldo Inicial, last_depreciation_period = '2025-12' (cierre inicial de migración)
        const targetInitNIIF = Number(a.initial_depreciation_niif) || 0;
        const targetInitFiscal = Number(a.initial_depreciation_fiscal) || targetInitNIIF;

        await run(`
          UPDATE niif_assets
          SET accumulated_depreciation_niif = ?,
              accumulated_depreciation_fiscal = ?,
              last_depreciation_period = '2025-12'
          WHERE id = ?
        `, [targetInitNIIF, targetInitFiscal, a.id]);
        restoredPrior2026++;
        console.log(`[Saldo Inicial] ${a.code} - ${a.name} -> Acum: $${targetInitNIIF.toLocaleString('es-CO')}, LastPeriod: '2025-12'`);
      }
    }

    // 2. Limpiar registros huérfanos de niif_asset_events para 2026-01 si existiesen
    const cleanEvents = await run("DELETE FROM niif_asset_events WHERE description LIKE '%2026-01%'");
    console.log(`Eventos huérfanos eliminados: ${cleanEvents.changes}`);

    // 3. Registrar auditoría formal
    const auditId = 'r' + Math.random().toString(16).slice(2, 16);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await run(`
      INSERT INTO audit_log (id, action, entity, entity_id, details, user_id, username, event_at)
      VALUES (?, 'REPAIR', 'niif_assets', 'all', 'Saneamiento de saldos de activos fijos y reapertura del periodo 2026-01 tras desincronización de comprobantes.', 'system', 'Sistema', ?)
    `, [auditId, nowStr]);

    await run('COMMIT');
    console.log('\n✅ TRANSACCIÓN CONFIRMADA EXITOSAMENTE.');
  } catch (err) {
    await run('ROLLBACK');
    console.error('❌ Error en el saneamiento, transacción revertida:', err.message);
    throw err;
  }

  // Comprobar totales finales
  const finalAssets = await query('SELECT code, name, cost, initial_depreciation_niif, accumulated_depreciation_niif, last_depreciation_period, purchase_date FROM niif_assets ORDER BY code');

  let totalCost = 0;
  let totalInit = 0;
  let totalAccum = 0;
  for (const r of finalAssets) {
    totalCost += Number(r.cost) || 0;
    totalInit += Number(r.initial_depreciation_niif) || 0;
    totalAccum += Number(r.accumulated_depreciation_niif) || 0;
  }

  console.log('\n=== RESULTADOS FINALES DE CONCILIACIÓN ===');
  console.log(`Costo Histórico Total: $ ${totalCost.toLocaleString('es-CO')}`);
  console.log(`Depreciación Inicial NIIF: $ ${totalInit.toLocaleString('es-CO')}`);
  console.log(`Depreciación Acumulada NIIF Actual: $ ${totalAccum.toLocaleString('es-CO')}`);
  console.log(`Diferencia Conciliada: $ ${totalAccum - totalInit}`);
  console.log(`Activos restaurados anteriores a 2026: ${restoredPrior2026}`);
  console.log(`Activos comprados en 2026 restablecidos: ${restoredFuture2026}`);

  db.close();
}

main().catch(console.error);

