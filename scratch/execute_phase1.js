const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const crypto = require('crypto');

function genPbId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath);

console.log('=== EJECUTANDO FASE 1: SANEAMIENTO DE DATOS PUERTO 8094 ===');

db.exec('BEGIN TRANSACTION;');

try {
  // 1. Re-vincular las 3 facturas huérfanas
  const orphanFixes = [
    { num: 'CF-202608-000181', txId: 'xd9fdpzvy422bwr' },
    { num: 'CF-202609-000181', txId: '6h6ioeiqa0voqyv' },
    { num: 'CF-202609-000182', txId: 'z38zm3e360k49s9' }
  ];

  for (const f of orphanFixes) {
    db.prepare("UPDATE ph_invoices SET tx_id = ?, status = 'posted' WHERE number = ?").run(f.txId, f.num);
    db.prepare("UPDATE transactions SET status = 'active', cross_type = 'ph_invoices', cross_number = ? WHERE id = ?").run(f.num, f.txId);
    console.log(`[OK] Factura huérfana ${f.num} vinculada a tx ${f.txId}`);
  }

  // 2. Activar transacción draft ws24o3zh9g7adjo
  db.prepare("UPDATE transactions SET status = 'active' WHERE id = 'ws24o3zh9g7adjo'").run();
  console.log('[OK] Transacción ws24o3zh9g7adjo (CF-202608-000129) activada a status=active');

  // 3. Sincronizar las 17 facturas con desfase en mora
  const moraInvs = [
    'CF-202606-000160', 'CF-202607-000015', 'CF-202607-000025', 'CF-202607-000051',
    'CF-202607-000084', 'CF-202607-000129', 'CF-202608-000025', 'CF-202608-000051',
    'CF-202608-000084', 'CF-202608-000129', 'CF-202609-000025', 'CF-202609-000032',
    'CF-202609-000038', 'CF-202609-000051', 'CF-202609-000074', 'CF-202609-000084',
    'CF-202609-000129'
  ];

  const ACC_CXC = '57plfjgxc8kevuq'; // 13459501
  const ACC_INCOME_ADMIN = 'l91zqp87xpkw1vy'; // 41701001
  const ACC_INCOME_MORA = '7ludetjnmcbzafk'; // 42100501

  const deleteTxLinesStmt = db.prepare("DELETE FROM tx_lines WHERE tx_id = ?");
  const insertTxLineStmt = db.prepare(`
    INSERT INTO tx_lines (
      account_id, credit, debit, description, id, line_order, tx_id,
      cross_doc_ref, third_party_id, branch_id, cost_center_id,
      cross_doc_date, due_date, is_iva_cost, import_id, import_concept,
      import_invoice_ref, import_trm
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  for (const num of moraInvs) {
    const inv = db.prepare("SELECT * FROM ph_invoices WHERE number = ?").get(num);
    if (!inv || !inv.tx_id) {
      console.warn(`[WARN] Factura ${num} no encontrada o sin tx_id`);
      continue;
    }
    const prop = db.prepare("SELECT id, code, name, owner_id FROM ph_properties WHERE id = ?").get(inv.property_id);
    const ownerId = prop?.owner_id || '';
    const invLines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ? ORDER BY line_order ASC").all(inv.id);

    // Borrar líneas causación anteriores
    deleteTxLinesStmt.run(inv.tx_id);

    let order = 1;
    // 1. Líneas débito a Cartera (13459501)
    for (const ln of invLines) {
      const amt = Number(ln.amount || 0);
      if (amt <= 0) continue;
      const desc = String(ln.description || '').toLowerCase();
      const isMora = desc.includes('mora') || desc.includes('interes');
      const cCode = isMora ? 'MORA' : 'ADM';
      const crossRef = `${num}-${cCode}`;

      insertTxLineStmt.run(
        ACC_CXC, 0, amt, `Factura ${num} [${cCode}] - ${inv.period} - Unidad ${prop?.code || ''}`,
        genPbId(), order++, inv.tx_id,
        crossRef, ownerId, 'eo3d07bscdpb7kd', '',
        inv.date, inv.due_date || inv.date, 0, '', '', '', 0
      );
    }

    // 2. Líneas crédito a Ingresos (41701001 o 42100501)
    for (const ln of invLines) {
      const amt = Number(ln.amount || 0);
      if (amt <= 0) continue;
      const desc = String(ln.description || '').toLowerCase();
      const isMora = desc.includes('mora') || desc.includes('interes');
      const targetAcc = isMora ? ACC_INCOME_MORA : ACC_INCOME_ADMIN;

      insertTxLineStmt.run(
        targetAcc, amt, 0, `${ln.description} - Factura ${num}`,
        genPbId(), order++, inv.tx_id,
        '', ownerId, 'eo3d07bscdpb7kd', '',
        inv.date, inv.due_date || inv.date, 0, '', '', '', 0
      );
    }

    // Actualizar datos del comprobante en transactions
    db.prepare(`
      UPDATE transactions 
      SET cross_amount = ?, cross_number = ?, cross_type = 'ph_invoices', cross_enabled = 1, status = 'active'
      WHERE id = ?
    `).run(inv.total, num, inv.tx_id);

    console.log(`[OK] Transacción ${inv.tx_id} para factura ${num} re-sincronizada perfectamente ($${inv.total})`);
  }

  db.exec('COMMIT;');
  console.log('\n=== FASE 1 COMPLETADA CON ÉXITO: TODAS LAS MUTACIONES CONFIRMADAS ===');
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('\n[ERROR FATAL EN FASE 1] Rollback ejecutado:', err);
  process.exit(1);
}

db.close();

