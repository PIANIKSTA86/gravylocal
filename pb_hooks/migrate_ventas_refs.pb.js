/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_ventas_refs.pb.js
 * Añade campos de referencias documentales a la factura de venta:
 * Orden de Compra del cliente, Número de Remisión, y los campos de forma de pago /
 * retenciones a favor por encabezado (ReteFuente, ReteICA, ReteIVA) que el frontend
 * ya utiliza pero que no existían como columnas reales en la colección invoices.
 */

onBootstrap((e) => {
  e.next();

  let invCol, lineCol;
  try {
    invCol = $app.findCollectionByNameOrId("invoices");
    lineCol = $app.findCollectionByNameOrId("invoice_lines");
  } catch (err) {
    console.log("[GRAVY-VENTAS-REFS] Error: no se pudo obtener la colección de ventas o de líneas: " + err);
    return;
  }

  try {
    let needsSaveInv = false;
    let needsSaveLine = false;

    const addFieldIfMissing = (col, name, type, options = {}) => {
      try {
        if (!col.fields.getByName(name)) {
          col.fields.add(new Field({
            name: name,
            type: type,
            required: false,
            ...options
          }));
          console.log(`[GRAVY-VENTAS-REFS] Agregando campo '${name}' a ${col.name}.`);
          return true;
        }
      } catch (err) {
        console.error(`[GRAVY-VENTAS-REFS] Error al intentar agregar campo ${name} a ${col.name}:`, err);
      }
      return false;
    };

    if (addFieldIfMissing(invCol, "po_number", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "remision_number", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "payment_form", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "payment_dian_code", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "ret_rule_renta_id", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "ret_rule_ica_id", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "ret_rule_iva_id", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "ret_mode", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "cross_doc_ref", "text")) needsSaveInv = true;
    if (addFieldIfMissing(invCol, "is_electronic", "bool")) needsSaveInv = true;

    if (addFieldIfMissing(lineCol, "ret_rule_id", "text")) needsSaveLine = true;

    if (needsSaveInv) {
      $app.save(invCol);
      console.log("[GRAVY-VENTAS-REFS] Campos de referencias documentales guardados en invoices con éxito.");
    }
    if (needsSaveLine) {
      $app.save(lineCol);
      console.log("[GRAVY-VENTAS-REFS] Campo ret_rule_id guardado en invoice_lines con éxito.");
    }
  } catch (err) {
    console.error("[GRAVY-VENTAS-REFS] Error al patchear colecciones de ventas/líneas: ", err);
  }
});
