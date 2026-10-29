import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

function generatePocketbaseId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars[crypto.randomInt(0, chars.length)];
  }
  return id;
}

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true });

console.log('--- EXECUTING SANEAMIENTO INTEGRAL ARYA (PUERTO 8094) ---');

db.exec('BEGIN TRANSACTION');

try {
  // 1. Anular las 96 facturas huérfanas
  const updateInvs = db.prepare(`
    UPDATE ph_invoices
    SET status = 'voided'
    WHERE period = '2026-05' AND (tx_id = '' OR tx_id IS NULL)
  `);
  const invRes = updateInvs.run();
  console.log(`Facturas huérfanas anuladas: ${invRes.changes}`);

  // 2. Reasignar cruces para Unidad 2604 en AC-202610-000003
  // Línea original gr6m3cj55opf8ds: credit 260319 con cross_doc_ref SI-202605-0026-ADM
  // Se cambia a credit 250000 con cross_doc_ref CF-202609-000079-ADM
  db.prepare(`
    UPDATE tx_lines
    SET credit = 250000,
        cross_doc_ref = 'CF-202609-000079-ADM',
        description = 'Abono Cuota de administración - Factura CF-202609-000079 (Unidad 2604)'
    WHERE id = 'gr6m3cj55opf8ds'
  `).run();

  // Se inserta la línea con el remanente de $10.319 para CF-202610-000079-ADM
  const newLineId2604 = generatePocketbaseId();
  db.prepare(`
    INSERT INTO tx_lines (
      id, tx_id, account_id, line_order, debit, credit, description, cross_doc_ref, third_party_id, branch_id, cost_center_id, cross_doc_date, due_date, is_iva_cost, import_id, import_concept, import_invoice_ref, import_trm
    ) VALUES (
      ?, 'fcdrfoypauyro2w', '57plfjgxc8kevuq', 6, 0, 10319, 'Abono Cuota de administración - Factura CF-202610-000079 (Unidad 2604)', 'CF-202610-000079-ADM', 'ym1tlg8onrs0mp6', 'eo3d07bscdpb7kd', '', '', '', 0, '', '', '', 0
    )
  `).run(newLineId2604);
  console.log('Unidad 2604 reasignada con éxito (CF-202609: $250.000, CF-202610: $10.319).');

  // 3. Reasignar cruces para Unidad 1403 en AC-202606-000004
  // Línea tx_line original: credit 265414 con SI-202605-0005-ADM
  // Dividir: $15.414 a SI-202605-0101-ADM y $250.000 a CF-202606-000023-ADM
  const line1403 = db.prepare("SELECT * FROM tx_lines WHERE cross_doc_ref = 'SI-202605-0005-ADM'").get();
  if (line1403) {
    db.prepare(`
      UPDATE tx_lines
      SET credit = 15414,
          cross_doc_ref = 'SI-202605-0101-ADM',
          description = 'Abono Cuota de administración - Factura SI-202605-0101 (Unidad 1403)'
      WHERE id = ?
    `).run(line1403.id);

    const newLineId1403 = generatePocketbaseId();
    db.prepare(`
      INSERT INTO tx_lines (
        id, tx_id, account_id, line_order, debit, credit, description, cross_doc_ref, third_party_id, branch_id, cost_center_id, cross_doc_date, due_date, is_iva_cost, import_id, import_concept, import_invoice_ref, import_trm
      ) VALUES (
        ?, ?, ?, 99, 0, 250000, 'Abono Cuota de administración - Factura CF-202606-000023 (Unidad 1403)', 'CF-202606-000023-ADM', ?, ?, '', '', '', 0, '', '', '', 0
      )
    `).run(newLineId1403, line1403.tx_id, line1403.account_id, line1403.third_party_id, line1403.branch_id);
    console.log('Unidad 1403 reasignada con éxito (SI-202605-0101: $15.414, CF-202606-000023: $250.000).');
  }

  // 4. Reasignar cruces para Unidad 4504 en AC-202610-000001
  // Línea original con SI-202605-0064-ADM por $260.251 -> CF-202608-000166-ADM
  db.prepare(`
    UPDATE tx_lines
    SET cross_doc_ref = 'CF-202608-000166-ADM',
        description = 'Abono Cuota de administración - Factura CF-202608-000166 (Unidad 4504)'
    WHERE cross_doc_ref = 'SI-202605-0064-ADM'
  `).run();
  console.log('Unidad 4504 reasignada con éxito a CF-202608-000166-ADM.');

  // 5. Reasignar cruces para Unidad 2801 en AC-202608-000003
  // Líneas con SI-202605-0030-ADM: $208.333 y $417.000 -> Total $625.333
  // Factura CF-202607-000084 es $296.800 y CF-202608-000084 es $293.771
  const lines2801 = db.prepare("SELECT * FROM tx_lines WHERE cross_doc_ref = 'SI-202605-0030-ADM'").all();
  if (lines2801.length >= 2) {
    db.prepare(`
      UPDATE tx_lines
      SET cross_doc_ref = 'CF-202607-000084-ADM',
          description = 'Abono CUOTA ADMINISTRACION - Factura CF-202607-000084 (Unidad 2801)'
      WHERE id = ?
    `).run(lines2801[0].id);

    db.prepare(`
      UPDATE tx_lines
      SET cross_doc_ref = 'CF-202608-000084-ADM',
          description = 'Abono CUOTA ADMINISTRACION - Factura CF-202608-000084 (Unidad 2801)'
      WHERE id = ?
    `).run(lines2801[1].id);
    console.log('Unidad 2801 reasignada con éxito a CF-202607 y CF-202608.');
  }

  db.exec('COMMIT');
  console.log('=== TRANSACCIÓN CONFIRMADA (COMMIT) EXITOSAMENTE ===');
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Error durante la remediación, se ejecutó ROLLBACK:', err);
}
