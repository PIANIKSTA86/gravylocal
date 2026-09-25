/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — migrate_import_reopen.pb.js
 * Migración para soporte de Reapertura y Descapitalización Controlada de Importaciones:
 * - capitalization_tx_id
 * - capitalization_mov_id
 * - reopened_count
 * - reopened_reason
 * - reopened_at
 */

onBootstrap((e) => {
  e.next();

  try {
    const impCol = $app.findCollectionByNameOrId("imports");
    if (!impCol) return;

    const impFieldNames = new Set(impCol.fields.fieldNames());
    let impChanged = false;

    if (!impFieldNames.has("capitalization_tx_id")) {
      impCol.fields.add(new TextField({ name: "capitalization_tx_id", required: false }));
      impChanged = true;
    }
    if (!impFieldNames.has("capitalization_mov_id")) {
      impCol.fields.add(new TextField({ name: "capitalization_mov_id", required: false }));
      impChanged = true;
    }
    if (!impFieldNames.has("reopened_count")) {
      impCol.fields.add(new NumberField({ name: "reopened_count", required: false, min: 0 }));
      impChanged = true;
    }
    if (!impFieldNames.has("reopened_reason")) {
      impCol.fields.add(new TextField({ name: "reopened_reason", required: false }));
      impChanged = true;
    }
    if (!impFieldNames.has("reopened_at")) {
      impCol.fields.add(new TextField({ name: "reopened_at", required: false }));
      impChanged = true;
    }

    // Direct SQLite table column additions if needed
    try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN capitalization_tx_id TEXT DEFAULT ''").execute(); } catch (_) {}
    try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN capitalization_mov_id TEXT DEFAULT ''").execute(); } catch (_) {}
    try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN reopened_count INTEGER DEFAULT 0").execute(); } catch (_) {}
    try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN reopened_reason TEXT DEFAULT ''").execute(); } catch (_) {}
    try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN reopened_at TEXT DEFAULT ''").execute(); } catch (_) {}

    if (impChanged) {
      $app.save(impCol);
      console.log("[GRAVY-IMPORT-REOPEN] Campos de reapertura agregados a imports en PocketBase.");
    }
  } catch (err) {
    console.log("[GRAVY-IMPORT-REOPEN] Error en migración: " + err);
  }
});
