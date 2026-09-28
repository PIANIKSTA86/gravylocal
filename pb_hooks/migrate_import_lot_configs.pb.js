/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_import_lot_configs.pb.js
 * Crea la colección 'import_lot_configs' para permitir la asignación de múltiples lotes
 * por producto dentro de un mismo expediente de importación.
 */

onBootstrap((e) => {
  e.next();

  let importsId = "";
  let importLinesId = "";
  let productsId = "";

  try {
    importsId = $app.findCollectionByNameOrId("imports").id;
    productsId = $app.findCollectionByNameOrId("products").id;
  } catch (err) {
    console.log("[GRAVY-IMPORT-LOTES] Aviso: no se pudieron obtener colecciones base imports/products: " + err);
    return;
  }

  try {
    importLinesId = $app.findCollectionByNameOrId("import_lines").id;
  } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  try {
    $app.findCollectionByNameOrId("import_lot_configs");
  } catch (_) {
    try {
      if (importsId && productsId) {
        const fields = [
          { name: "import_id", type: "relation", required: true, collectionId: importsId, maxSelect: 1, cascadeDelete: true },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, maxSelect: 1, cascadeDelete: false },
          { name: "lot_number", type: "text", required: true },
          { name: "qty", type: "number", required: true, min: 0.001 },
          { name: "manufacturing_date", type: "text", required: false },
          { name: "expiry_date", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ];

        if (importLinesId) {
          fields.splice(2, 0, { name: "import_line_id", type: "relation", required: false, collectionId: importLinesId, maxSelect: 1, cascadeDelete: true });
        }

        const col = new Collection({
          name: "import_lot_configs",
          type: "base",
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: fields,
          indexes: ["CREATE INDEX IF NOT EXISTS idx_imp_lot_cfg ON import_lot_configs (import_id)"]
        });
        $app.save(col);
        console.log("[GRAVY-IMPORT-LOTES] Colección 'import_lot_configs' creada exitosamente.");
      }
    } catch (err) {
      console.log("[GRAVY-IMPORT-LOTES] Error al crear import_lot_configs: " + err);
    }
  }
});
