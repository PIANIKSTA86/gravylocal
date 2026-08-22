/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY HUB v2.0 — Migración Spa Belleza
 * Extiende los valores permitidos del campo module_key en la colección licenses del HUB.
 */
onBootstrap((e) => {
  e.next();
  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    const moduleKeyField = licensesCol.fields.findByName("module_key");
    if (moduleKeyField) {
      const values = moduleKeyField.values || [];
      if (!values.includes("spa-belleza")) {
        values.push("spa-belleza");
        moduleKeyField.values = values;
        $app.save(licensesCol);
        console.log("[GRAVY HUB] Campo module_key de licenses extendido con 'spa-belleza'.");
      }
    }
  } catch (err) {
    console.error("[GRAVY HUB] Error al extender allowed values de licenses.module_key:", err);
  }
});
