/// <reference path="../pb_data/types.d.ts" />

/**
 * Migración / Extensión de campos RADIAN para la colección `electronic_documents`.
 * Permite trazabilidad completa de los eventos 030, 032, 033 y 031 ante la DIAN
 * consumidos a través de MATIAS API y recepción de facturas.
 */
onBootstrap((e) => {
  e.next();

  try {
    const col = $app.findCollectionByNameOrId("electronic_documents");
    if (!col) return;

    let colChanged = false;

    const fieldsToAdd = [
      "radian_030_status",      // none, pending, sent, rejected
      "radian_030_date",        // Fecha/hora de acuse
      "radian_030_cude",        // CUDE generado por la DIAN
      "radian_032_status",      // none, pending, sent, rejected
      "radian_032_date",        // Fecha/hora de recibo de bien
      "radian_032_cude",        // CUDE generado por la DIAN
      "radian_033_status",      // none, pending, sent, rejected (Aceptación expresa)
      "radian_033_date",        // Fecha/hora de aceptación
      "radian_033_cude",        // CUDE generado por la DIAN
      "radian_031_status",      // none, sent, rejected (Reclamo)
      "radian_031_claim_code",  // '01', '02', '03', '04'
      "radian_031_notes",       // Justificación del reclamo
      "radian_last_response",   // Mensaje devuelto por la DIAN
      "reception_source",       // 'email', 'excel_dian', 'manual_cufe', 'xml_upload'
      "matias_reception_id"     // ID de recepción interno en MATIAS API
    ];

    for (let i = 0; i < fieldsToAdd.length; i++) {
      const fieldName = fieldsToAdd[i];
      if (!col.fields.getByName(fieldName)) {
        col.fields.add(new Field({
          name: fieldName,
          type: "text",
          required: false
        }));
        colChanged = true;
      }
    }

    if (colChanged) {
      $app.save(col);
      console.log("[GRAVY-RADIAN] Colección electronic_documents actualizada exitosamente con campos RADIAN.");
    }
  } catch (err) {
    console.warn("[GRAVY-RADIAN] Error verificando/migrando campos RADIAN: " + err);
  }
});
