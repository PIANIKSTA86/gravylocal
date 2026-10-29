/// <reference path="../pb_data/types.d.ts" />

/**
 * Migración / Extensión de campos para Documento Soporte Electrónico
 * en la colección `purchase_invoices`.
 * Permite trazabilidad directa del estado DIAN, CUDS, respuesta y XML firmado.
 */
onBootstrap((e) => {
  e.next();

  try {
    const col = $app.findCollectionByNameOrId("purchase_invoices");
    if (!col) return;

    let colChanged = false;

    const fieldsConfig = [
      { name: "status_dian", id: "text_status_dian", max: 50 },
      { name: "cuds", id: "text_cuds", max: 500 },
      { name: "dian_response", id: "text_dian_response", max: 100000 },
      { name: "xml_content", id: "text_xml_content", max: 1000000 }
    ];

    for (let i = 0; i < fieldsConfig.length; i++) {
      const cfg = fieldsConfig[i];
      const existing = col.fields.getByName(cfg.name);
      if (!existing) {
        col.fields.add(new Field({
          id: cfg.id,
          name: cfg.name,
          type: "text",
          max: cfg.max,
          required: false
        }));
        colChanged = true;
      } else if (existing.max < cfg.max) {
        existing.max = cfg.max;
        colChanged = true;
      }
    }

    const existingCc = col.fields.getByName("cost_center_id");
    if (!existingCc) {
      let costCentersColId = "";
      try { costCentersColId = $app.findCollectionByNameOrId("cost_centers").id; } catch (_) {}
      col.fields.add(new Field({
        id: "rel_cost_center_pur",
        name: "cost_center_id",
        type: "relation",
        required: false,
        collectionId: costCentersColId,
        maxSelect: 1,
        cascadeDelete: false
      }));
      colChanged = true;
    }

    if (colChanged) {
      $app.save(col);
      console.log("[GRAVY-DS] Colección purchase_invoices actualizada exitosamente con campos de Documento Soporte.");
    }
  } catch (err) {
    console.warn("[GRAVY-DS] Error verificando/migrando campos Documento Soporte: " + err);
  }
});
