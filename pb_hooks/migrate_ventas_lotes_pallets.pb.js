/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_ventas_lotes_pallets.pb.js
 * Migración para control opcional de trazabilidad en productos y salidas por venta:
 * - products: track_lots, track_pallets
 * - invoice_lines: lot_id, lot_number, pallet_id, pallet_code, boxes_qty
 * - inventory_movement_lines: lot_id, lot_number, pallet_id, pallet_code, boxes_qty
 * - logistica_delivery_lines: lot_id, pallet_id, boxes_qty
 */

onBootstrap((e) => {
  e.next();

  let inventoryLotsId = "";
  let inventoryPalletsId = "";
  try { inventoryLotsId = $app.findCollectionByNameOrId("inventory_lots").id; } catch (_) {}
  try { inventoryPalletsId = $app.findCollectionByNameOrId("inventory_pallets").id; } catch (_) {}

  // 1. Maestro de Productos: track_lots y track_pallets
  try {
    const productsCol = $app.findCollectionByNameOrId("products");
    let changed = false;

    if (!productsCol.fields.getByName("track_lots")) {
      try {
        productsCol.fields.add(new BoolField({ name: "track_lots", required: false }));
      } catch (_) {
        productsCol.fields.add(new Field({ name: "track_lots", type: "bool", required: false }));
      }
      changed = true;
    }

    if (!productsCol.fields.getByName("track_pallets")) {
      try {
        productsCol.fields.add(new BoolField({ name: "track_pallets", required: false }));
      } catch (_) {
        productsCol.fields.add(new Field({ name: "track_pallets", type: "bool", required: false }));
      }
      changed = true;
    }

    if (changed) {
      $app.save(productsCol);
      console.log("[GRAVY-VENTAS-LOTES] Campos track_lots y track_pallets agregados a products.");
    }
  } catch (err) {
    console.error("[GRAVY-VENTAS-LOTES] Error en colección products:", err);
  }

  // 2. Líneas de Factura Comercial: invoice_lines
  try {
    const invLinesCol = $app.findCollectionByNameOrId("invoice_lines");
    let changed = false;

    if (!invLinesCol.fields.getByName("lot_id") && inventoryLotsId) {
      try {
        invLinesCol.fields.add(new RelationField({ name: "lot_id", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false }));
      } catch (_) {
        invLinesCol.fields.add(new Field({ name: "lot_id", type: "relation", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false }));
      }
      changed = true;
    }

    if (!invLinesCol.fields.getByName("lot_number")) {
      try {
        invLinesCol.fields.add(new TextField({ name: "lot_number", required: false }));
      } catch (_) {
        invLinesCol.fields.add(new Field({ name: "lot_number", type: "text", required: false }));
      }
      changed = true;
    }

    if (!invLinesCol.fields.getByName("pallet_id") && inventoryPalletsId) {
      try {
        invLinesCol.fields.add(new RelationField({ name: "pallet_id", required: false, collectionId: inventoryPalletsId, maxSelect: 1, cascadeDelete: false }));
      } catch (_) {
        invLinesCol.fields.add(new Field({ name: "pallet_id", type: "relation", required: false, collectionId: inventoryPalletsId, maxSelect: 1, cascadeDelete: false }));
      }
      changed = true;
    }

    if (!invLinesCol.fields.getByName("pallet_code")) {
      try {
        invLinesCol.fields.add(new TextField({ name: "pallet_code", required: false }));
      } catch (_) {
        invLinesCol.fields.add(new Field({ name: "pallet_code", type: "text", required: false }));
      }
      changed = true;
    }

    if (!invLinesCol.fields.getByName("boxes_qty")) {
      try {
        invLinesCol.fields.add(new NumberField({ name: "boxes_qty", required: false, min: 0 }));
      } catch (_) {
        invLinesCol.fields.add(new Field({ name: "boxes_qty", type: "number", required: false, min: 0 }));
      }
      changed = true;
    }

    if (changed) {
      $app.save(invLinesCol);
      console.log("[GRAVY-VENTAS-LOTES] Campos de lote y estiba agregados a invoice_lines.");
    }
  } catch (err) {
    console.error("[GRAVY-VENTAS-LOTES] Error en colección invoice_lines:", err);
  }

  // 3. Líneas de Movimiento de Inventario: inventory_movement_lines
  try {
    const movLinesCol = $app.findCollectionByNameOrId("inventory_movement_lines");
    let changed = false;

    if (!movLinesCol.fields.getByName("lot_id") && inventoryLotsId) {
      try {
        movLinesCol.fields.add(new RelationField({ name: "lot_id", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false }));
      } catch (_) {
        movLinesCol.fields.add(new Field({ name: "lot_id", type: "relation", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false }));
      }
      changed = true;
    }

    if (!movLinesCol.fields.getByName("lot_number")) {
      try {
        movLinesCol.fields.add(new TextField({ name: "lot_number", required: false }));
      } catch (_) {
        movLinesCol.fields.add(new Field({ name: "lot_number", type: "text", required: false }));
      }
      changed = true;
    }

    if (!movLinesCol.fields.getByName("pallet_id") && inventoryPalletsId) {
      try {
        movLinesCol.fields.add(new RelationField({ name: "pallet_id", required: false, collectionId: inventoryPalletsId, maxSelect: 1, cascadeDelete: false }));
      } catch (_) {
        movLinesCol.fields.add(new Field({ name: "pallet_id", type: "relation", required: false, collectionId: inventoryPalletsId, maxSelect: 1, cascadeDelete: false }));
      }
      changed = true;
    }

    if (!movLinesCol.fields.getByName("pallet_code")) {
      try {
        movLinesCol.fields.add(new TextField({ name: "pallet_code", required: false }));
      } catch (_) {
        movLinesCol.fields.add(new Field({ name: "pallet_code", type: "text", required: false }));
      }
      changed = true;
    }

    if (!movLinesCol.fields.getByName("boxes_qty")) {
      try {
        movLinesCol.fields.add(new NumberField({ name: "boxes_qty", required: false, min: 0 }));
      } catch (_) {
        movLinesCol.fields.add(new Field({ name: "boxes_qty", type: "number", required: false, min: 0 }));
      }
      changed = true;
    }

    if (changed) {
      $app.save(movLinesCol);
      console.log("[GRAVY-VENTAS-LOTES] Campos de lote y estiba agregados a inventory_movement_lines.");
    }
  } catch (err) {
    console.error("[GRAVY-VENTAS-LOTES] Error en colección inventory_movement_lines:", err);
  }

  // 4. Líneas de Entrega / Despacho: logistica_delivery_lines
  try {
    const delLinesCol = $app.findCollectionByNameOrId("logistica_delivery_lines");
    let changed = false;

    if (!delLinesCol.fields.getByName("lot_id") && inventoryLotsId) {
      try {
        delLinesCol.fields.add(new RelationField({ name: "lot_id", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false }));
      } catch (_) {
        delLinesCol.fields.add(new Field({ name: "lot_id", type: "relation", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false }));
      }
      changed = true;
    }

    if (!delLinesCol.fields.getByName("pallet_id") && inventoryPalletsId) {
      try {
        delLinesCol.fields.add(new RelationField({ name: "pallet_id", required: false, collectionId: inventoryPalletsId, maxSelect: 1, cascadeDelete: false }));
      } catch (_) {
        delLinesCol.fields.add(new Field({ name: "pallet_id", type: "relation", required: false, collectionId: inventoryPalletsId, maxSelect: 1, cascadeDelete: false }));
      }
      changed = true;
    }

    if (!delLinesCol.fields.getByName("boxes_qty")) {
      try {
        delLinesCol.fields.add(new NumberField({ name: "boxes_qty", required: false, min: 0 }));
      } catch (_) {
        delLinesCol.fields.add(new Field({ name: "boxes_qty", type: "number", required: false, min: 0 }));
      }
      changed = true;
    }

    if (changed) {
      $app.save(delLinesCol);
      console.log("[GRAVY-VENTAS-LOTES] Campos de lote y estiba agregados a logistica_delivery_lines.");
    }
  } catch (err) {
    console.error("[GRAVY-VENTAS-LOTES] Error en colección logistica_delivery_lines:", err);
  }
});
