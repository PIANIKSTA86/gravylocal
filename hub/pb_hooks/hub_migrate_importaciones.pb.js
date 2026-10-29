/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY HUB v2.0 — Migración Importaciones
 * Extiende los valores permitidos del campo module_key en la colección licenses del HUB.
 */
onBootstrap((e) => {
  e.next();
  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    const moduleKeyField = licensesCol.fields.getByName("module_key");
    if (moduleKeyField) {
      const values = moduleKeyField.values || [];
      if (!values.includes("importaciones")) {
        values.push("importaciones");
        moduleKeyField.values = values;
        $app.save(licensesCol);
        console.log("[GRAVY HUB] Campo module_key de licenses extendido con 'importaciones'.");
      }
    }
  } catch (err) {
    console.error("[GRAVY HUB] Error al extender allowed values de licenses.module_key:", err);
  }
});
