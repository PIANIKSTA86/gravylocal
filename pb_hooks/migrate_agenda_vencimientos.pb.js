/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_agenda_vencimientos.pb.js
 * Crea o actualiza la colección agenda_vencimientos en onBootstrap.
 */

onBootstrap((e) => {
  e.next();

  const writeRule = "@request.auth.id != ''";
  const deleteRule = "@request.auth.id != ''";

  try {
    // Si la colección ya existe, parcheamos amount y type values
    const col = $app.findCollectionByNameOrId("agenda_vencimientos");
    let changed = false;

    const amountField = col.fields.getByName("amount");
    if (amountField && amountField.required) {
      amountField.required = false;
      changed = true;
    }

    const typeField = col.fields.getByName("type");
    if (typeField && typeField.values) {
      const needed = ["cxp_proveedor", "cxp_importacion", "cxc_cliente", "impuesto_dian_iva", "impuesto_dian_retencion", "exogena_dian", "otro"];
      const currentValues = Array.from(typeField.values);
      for (const val of needed) {
        if (!currentValues.includes(val)) {
          currentValues.push(val);
          changed = true;
        }
      }
      typeField.values = currentValues;
    }

    if (changed) {
      $app.save(col);
      console.log("[GRAVY-AGENDA] Parche de esquema aplicado: 'amount' y 'type' actualizados.");
    }
  } catch (_) {
    // Si no existe, la creamos desde cero
    try {
      const coll = new Collection({
        name: "agenda_vencimientos",
        type: "base",
        listRule: writeRule,
        viewRule: writeRule,
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "type", type: "select", required: true, values: ["cxp_proveedor", "cxp_importacion", "cxc_cliente", "impuesto_dian_iva", "impuesto_dian_retencion", "exogena_dian", "otro"] },
          { name: "title", type: "text", required: true },
          { name: "description", type: "text", required: false },
          { name: "due_date", type: "text", required: true },
          { name: "amount", type: "number", required: false, min: 0 },
          { name: "status", type: "select", required: true, values: ["pendiente", "programado", "pagado", "vencido"] },
          { name: "assigned_roles", type: "json", required: false }
        ]
      });
      $app.save(coll);
      console.log("[GRAVY-AGENDA] Colección agenda_vencimientos creada.");
    } catch (err) {
      console.log("[GRAVY-AGENDA] Error al crear agenda_vencimientos: " + err);
    }
  }
});
