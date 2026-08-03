/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_warehouses_relations.pb.js
 * Crea las relaciones de bodega por defecto y bodegas permitidas en el usuario.
 */

onBootstrap((e) => {
  e.next();

  let warehousesCol;
  let warehousesId = "";

  try {
    warehousesCol = $app.findCollectionByNameOrId("warehouses");
    warehousesId = warehousesCol.id;
  } catch (err) {
    console.error("[GRAVY-WAREHOUSES] Colección warehouses no encontrada:", err);
    return;
  }

  // Helper para añadir relación a warehouses de forma segura e idempotente
  function addWarehouseRelation(collectionName, fieldName, maxSelect = 1) {
    try {
      const col = $app.findCollectionByNameOrId(collectionName);
      const existing = new Set(col.fields.fieldNames());
      let modified = false;

      if (!existing.has(fieldName)) {
        col.fields.add(new RelationField({
          name: fieldName,
          collectionId: warehousesId,
          required: false,
          cascadeDelete: false,
          maxSelect: maxSelect
        }));
        modified = true;
        console.log(`[GRAVY-WAREHOUSES] Campo ${fieldName} agregado a ${collectionName}.`);
      }

      if (modified) {
        $app.save(col);
      }
    } catch (err) {
      console.log(`[GRAVY-WAREHOUSES] Aviso al asegurar relación en ${collectionName}: ${err}`);
    }
  }

  if (warehousesId) {
    addWarehouseRelation("users", "default_warehouse_id", 1);
    addWarehouseRelation("users", "allowed_warehouses", 99);
  }
});
