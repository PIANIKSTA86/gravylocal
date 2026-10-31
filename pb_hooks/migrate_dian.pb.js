/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  try {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    const dianKeys = [
      ["dian_environment", "2"],
      ["dian_nit", ""],
      ["dian_cltec", ""],
      ["dian_software_id", ""],
      ["dian_software_pin", ""],
      ["dian_certificate_base64", ""],
      ["dian_certificate_password", ""],
      ["einvoice_method", "dian"],
      ["ftech_username", ""],
      ["ftech_password", ""],
      ["ftech_environment", "2"],
      ["company_third_party_id", ""]
    ];

    for (const [k, v] of dianKeys) {
      try {
        $app.findFirstRecordByFilter("settings", "key = '" + k + "'");
      } catch (_) {
        const r = new Record(settingsCol, { key: k, value: v });
        $app.save(r);
        console.log("[GRAVY] Migración DIAN — Creada configuración: " + k);
      }
    }
  } catch (err) {
    console.error("[GRAVY] Error en migración de configuración DIAN:", err);
  }

  // Agregar campos ftech_transaction_id, zip_filename y document_number a la colección einvoice_docs
  try {
    const docsCol = $app.findCollectionByNameOrId("einvoice_docs");
    const docFields = new Set(docsCol.fields.fieldNames());
    let modified = false;
    if (!docFields.has("document_number")) {
      docsCol.fields.add(new TextField({
        name: "document_number",
        max: 100,
        required: false
      }));
      modified = true;
    }
    if (!docFields.has("ftech_transaction_id")) {
      docsCol.fields.add(new TextField({
        name: "ftech_transaction_id",
        required: false
      }));
      modified = true;
    }
    if (!docFields.has("zip_filename")) {
      docsCol.fields.add(new TextField({
        name: "zip_filename",
        required: false
      }));
      modified = true;
    }
    if (modified) {
      $app.save(docsCol);
      console.log("[GRAVY] Migración DIAN — Colección einvoice_docs actualizada (campos agregados, incluyendo document_number).");
    }

    // Backfill retroactivo: asignar document_number a los registros existentes que no lo tengan
    try {
      const recordsWithoutNum = $app.findRecordsByFilter("einvoice_docs", "document_number = '' || document_number = null", "", 1000);
      let backfilledCount = 0;
      for (let i = 0; i < recordsWithoutNum.length; i++) {
        const docRec = recordsWithoutNum[i];
        const txId = docRec.getString("tx_id");
        if (txId) {
          try {
            const tx = $app.findRecordById("transactions", txId);
            if (tx && tx.getString("number")) {
              docRec.set("document_number", tx.getString("number"));
              $app.save(docRec);
              backfilledCount++;
            }
          } catch (_) {}
        }
      }
      if (backfilledCount > 0) {
        console.log(`[GRAVY] Migración DIAN — ${backfilledCount} registros en einvoice_docs actualizados con su document_number.`);
      }
    } catch (bfErr) {
      console.warn("[GRAVY] Error en backfill de document_number en einvoice_docs:", bfErr);
    }
  } catch (err) {
    console.error("[GRAVY] Error al modificar la colección einvoice_docs:", err);
  }
});

