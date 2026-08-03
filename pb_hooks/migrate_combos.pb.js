/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_combos.pb.js
 * Crea la colección product_components y extiende products con is_combo.
 */

onBootstrap((e) => {
  e.next();

  let productsId = "";
  try {
    const productsCol = $app.findCollectionByNameOrId("products");
    productsId = productsCol.id;

    // 1. Agregar campo 'is_combo' a la colección products si no existe
    const existingFields = new Set(productsCol.fields.fieldNames());
    if (!existingFields.has("is_combo")) {
      productsCol.fields.add(new BoolField({ name: "is_combo", required: false }));
      $app.save(productsCol);
      console.log("[GRAVY-COMBOS] Campo is_combo agregado a la colección products.");
    }
  } catch (err) {
    console.log("[GRAVY-COMBOS] Error al inicializar/extender products: " + err);
    return;
  }

  // 2. Crear la colección product_components si no existe
  try {
    $app.findCollectionByNameOrId("product_components");
    // Ya existe, nada que hacer
  } catch (_) {
    try {
      const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";
      const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

      const productComponents = new Collection({
        name: "product_components",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "parent_id",    type: "relation", required: true, collectionId: productsId, cascadeDelete: true },
          { name: "component_id", type: "relation", required: true, collectionId: productsId, cascadeDelete: false },
          { name: "qty",          type: "number",   required: true, min: 0.0001 }
        ]
      });
      $app.save(productComponents);
      console.log("[GRAVY-COMBOS] Colección product_components creada.");

      // Asegurar índice único (parent_id, component_id)
      try {
        $app.nonconcurrentDB()
          .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_prod_comp_parent_child ON product_components (parent_id, component_id)")
          .execute();
        console.log("[GRAVY-COMBOS] Índice único idx_prod_comp_parent_child creado.");
      } catch (idxErr) {
        console.log("[GRAVY-COMBOS] Aviso al crear índice único: " + idxErr);
      }
    } catch (err) {
      console.log("[GRAVY-COMBOS] Error al crear colección product_components: " + err);
    }
  }
});
