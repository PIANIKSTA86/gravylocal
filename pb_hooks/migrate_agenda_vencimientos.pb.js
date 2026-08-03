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
    // Si la colección ya existe, parcheamos el campo amount para que no sea requerido
    const col = $app.findCollectionByNameOrId("agenda_vencimientos");
    const amountField = col.fields.getByName("amount");
    if (amountField && amountField.required) {
      amountField.required = false;
      $app.save(col);
      console.log("[GRAVY-AGENDA] Parche de esquema aplicado: campo 'amount' ajustado a required=false.");
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
          { name: "type", type: "select", required: true, values: ["cxp_proveedor", "impuesto_dian_iva", "impuesto_dian_retencion", "exogena_dian", "otro"] },
          { name: "title", type: "text", required: true },
          { name: "description", type: "text", required: false },
          { name: "due_date", type: "text", required: true },
          { name: "amount", type: "number", required: false, min: 0 }, // required: false para permitir pre-cargar impuestos en $0
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
