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
      ["dian_certificate_password", ""]
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
});
