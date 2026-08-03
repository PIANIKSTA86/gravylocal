/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — prevent_tx_type_delete.pb.js
 * Impide la eliminación de tipos de transacción (transaction_types) que tengan registros relacionados
 * en transactions, invoices o purchase_invoices.
 */

onRecordDeleteRequest((e) => {
  const id = String(e.record.id || "").trim();
  if (!id) {
    e.next();
    return;
  }

  // 1. Verificar en transactions
  let hasDocs = false;
  try {
    $app.findFirstRecordByFilter("transactions", "tx_type_id = '" + id + "'");
    hasDocs = true;
  } catch (_) {}
  if (hasDocs) {
    throw new BadRequestError("No se puede eliminar la serie porque tiene transacciones contables asociadas.");
  }

  // 2. Verificar en invoices (ventas)
  try {
    $app.findFirstRecordByFilter("invoices", "tx_type_id = '" + id + "'");
    hasDocs = true;
  } catch (_) {}
  if (hasDocs) {
    throw new BadRequestError("No se puede eliminar la serie porque tiene facturas de venta asociadas.");
  }

  // 3. Verificar en purchase_invoices (compras)
  try {
    $app.findFirstRecordByFilter("purchase_invoices", "tx_type_id = '" + id + "'");
    hasDocs = true;
  } catch (_) {}
  if (hasDocs) {
    throw new BadRequestError("No se puede eliminar la serie porque tiene facturas de compra asociadas.");
  }

  e.next();
}, "transaction_types");
