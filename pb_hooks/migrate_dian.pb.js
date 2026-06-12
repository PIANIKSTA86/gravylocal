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
      ["ftech_environment", "2"]
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

  // Agregar campo ftech_transaction_id a la colección einvoice_docs
  try {
    const docsCol = $app.findCollectionByNameOrId("einvoice_docs");
    const docFields = new Set(docsCol.fields.fieldNames());
    let modified = false;
    if (!docFields.has("ftech_transaction_id")) {
      docsCol.fields.add(new TextField({
        name: "ftech_transaction_id",
        required: false
      }));
      modified = true;
    }
    if (modified) {
      $app.save(docsCol);
      console.log("[GRAVY] Migración DIAN — Agregado campo ftech_transaction_id a einvoice_docs.");
    }
  } catch (err) {
    console.error("[GRAVY] Error al modificar la colección einvoice_docs:", err);
  }
});

