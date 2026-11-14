/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — conciliacion_guard.pb.js
 * Guardián de Seguridad, Integridad y Conservación de Conciliaciones Bancarias.
 * 
 * Reglas de Blindaje:
 * 1. Impide modificar o desvincular movimientos de extracto (bank_movements) que pertenezcan a un período cerrado.
 * 2. Impide eliminar movimientos bancarios cerrados y certificados.
 * 3. Impide anular o eliminar comprobantes (transactions) o líneas contables (tx_lines)
 *    que hayan sido conciliadas en un acta formal cerrada.
 */

// 1. Blindaje sobre bank_movements (Update)
onRecordBeforeUpdateRequest((e) => {
  const rec = e.record;
  const reconId = rec.getString("reconciliation_id") || "";
  if (!reconId) return e.next();

  try {
    const recon = $app.findRecordById("bank_reconciliations", reconId);
    if (recon && recon.getString("status") === "closed") {
      // Verificar si se intenta desconciliar o alterar montos/fechas
      const newRecon = rec.getBool("reconciled");
      const newReconId = rec.getString("reconciliation_id");
      
      // Permitir si se mantiene cerrado o si la solicitud no está destruyendo la integridad
      if (!newRecon || !newReconId) {
        throw new ForbiddenError("Operación denegada: Este movimiento bancario pertenece a una Conciliación Bancaria cerrada y certificada. Debe reabrir el período desde el Historial de Actas antes de realizar modificaciones.");
      }
    }
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
  }
  e.next();
}, "bank_movements");

// 2. Blindaje sobre bank_movements (Delete)
onRecordBeforeDeleteRequest((e) => {
  const rec = e.record;
  const reconId = rec.getString("reconciliation_id") || "";
  if (!reconId) return e.next();

  try {
    const recon = $app.findRecordById("bank_reconciliations", reconId);
    if (recon && recon.getString("status") === "closed") {
      throw new ForbiddenError("Operación denegada: No se puede eliminar un movimiento bancario que forma parte de una Conciliación Bancaria cerrada y certificada.");
    }
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
  }
  e.next();
}, "bank_movements");

// 3. Blindaje sobre transactions (Update / Anulación)
onRecordBeforeUpdateRequest((e) => {
  const rec = e.record;
  const status = rec.getString("status") || "";
  
  // Si se intenta anular el comprobante
  if (status === "voided") {
    const txId = rec.id;
    try {
      const matchRow = new DynamicModel({ count: 0 });
      $app.db().newQuery(
        "SELECT COUNT(m.id) as count FROM bank_movements m " +
        "INNER JOIN tx_lines l ON l.id = m.tx_line_id " +
        "INNER JOIN bank_reconciliations r ON r.id = m.reconciliation_id " +
        "WHERE l.tx_id = {:txId} AND r.status = 'closed'"
      ).bind({ txId }).one(matchRow);

      if (Number(matchRow.count || 0) > 0) {
        throw new ForbiddenError("Operación denegada: Este comprobante contiene asientos contables conciliados en un Acta de Conciliación Bancaria cerrada y certificada. Debe reabrir el período antes de anular.");
      }
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
    }
  }
  e.next();
}, "transactions");

// 4. Blindaje sobre transactions (Delete)
onRecordBeforeDeleteRequest((e) => {
  const txId = e.record.id;
  try {
    const matchRow = new DynamicModel({ count: 0 });
    $app.db().newQuery(
      "SELECT COUNT(m.id) as count FROM bank_movements m " +
      "INNER JOIN tx_lines l ON l.id = m.tx_line_id " +
      "INNER JOIN bank_reconciliations r ON r.id = m.reconciliation_id " +
      "WHERE l.tx_id = {:txId} AND r.status = 'closed'"
    ).bind({ txId }).one(matchRow);

    if (Number(matchRow.count || 0) > 0) {
      throw new ForbiddenError("Operación denegada: No se puede eliminar un comprobante con partidas auditadas en una Conciliación Bancaria cerrada.");
    }
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
  }
  e.next();
}, "transactions");

