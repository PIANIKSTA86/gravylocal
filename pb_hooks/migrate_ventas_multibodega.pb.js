/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_ventas_multibodega.pb.js
 * Migración para facturación multi-bodega en una sola factura de venta:
 * - invoice_lines: warehouse_id (relación a warehouses)
 * - sales_order_lines: warehouse_id (relación a warehouses)
 * - invoices: inv_movement_ids (relación múltiple a inventory_movements)
 */

onBootstrap((e) => {
  e.next();

  let warehousesId = "";
  let inventoryMovementsId = "";
  try { warehousesId = $app.findCollectionByNameOrId("warehouses").id; } catch (_) {}
  try { inventoryMovementsId = $app.findCollectionByNameOrId("inventory_movements").id; } catch (_) {}

  if (!warehousesId) {
    console.warn("[GRAVY-VENTAS-MULTIBODEGA] Colección warehouses no encontrada.");
    return;
  }

  // 1. Líneas de Factura Comercial: invoice_lines -> warehouse_id
  try {
    const invLinesCol = $app.findCollectionByNameOrId("invoice_lines");
    let changed = false;

    if (!invLinesCol.fields.getByName("warehouse_id")) {
      try {
        invLinesCol.fields.add(new RelationField({
          name: "warehouse_id",
          required: false,
          collectionId: warehousesId,
          maxSelect: 1,
          cascadeDelete: false
        }));
      } catch (_) {
        invLinesCol.fields.add(new Field({
          name: "warehouse_id",
          type: "relation",
          required: false,
          collectionId: warehousesId,
          maxSelect: 1,
          cascadeDelete: false
        }));
      }
      changed = true;
    }

    if (changed) {
      $app.save(invLinesCol);
      console.log("[GRAVY-VENTAS-MULTIBODEGA] Campo warehouse_id agregado a invoice_lines.");
    }
  } catch (err) {
    console.error("[GRAVY-VENTAS-MULTIBODEGA] Error en colección invoice_lines:", err);
  }

  // 2. Líneas de Pedido de Venta: sales_order_lines -> warehouse_id (si existe la colección)
  try {
    const soLinesCol = $app.findCollectionByNameOrId("sales_order_lines");
    if (soLinesCol && !soLinesCol.fields.getByName("warehouse_id")) {
      try {
        soLinesCol.fields.add(new RelationField({
          name: "warehouse_id",
          required: false,
          collectionId: warehousesId,
          maxSelect: 1,
          cascadeDelete: false
        }));
      } catch (_) {
        soLinesCol.fields.add(new Field({
          name: "warehouse_id",
          type: "relation",
          required: false,
          collectionId: warehousesId,
          maxSelect: 1,
          cascadeDelete: false
        }));
      }
      $app.save(soLinesCol);
      console.log("[GRAVY-VENTAS-MULTIBODEGA] Campo warehouse_id agregado a sales_order_lines.");
    }
  } catch (_) {}

  // 3. Facturas de Venta: invoices -> inv_movement_ids (relación múltiple)
  if (inventoryMovementsId) {
    try {
      const invoicesCol = $app.findCollectionByNameOrId("invoices");
      let changed = false;

      if (!invoicesCol.fields.getByName("inv_movement_ids")) {
        try {
          invoicesCol.fields.add(new RelationField({
            name: "inv_movement_ids",
            required: false,
            collectionId: inventoryMovementsId,
            maxSelect: 99,
            cascadeDelete: false
          }));
        } catch (_) {
          invoicesCol.fields.add(new Field({
            name: "inv_movement_ids",
            type: "relation",
            required: false,
            collectionId: inventoryMovementsId,
            maxSelect: 99,
            cascadeDelete: false
          }));
        }
        changed = true;
      }

      if (changed) {
        $app.save(invoicesCol);
        console.log("[GRAVY-VENTAS-MULTIBODEGA] Campo inv_movement_ids agregado a invoices.");
      }
    } catch (err) {
      console.error("[GRAVY-VENTAS-MULTIBODEGA] Error en colección invoices:", err);
    }
  }

  // 4. Asegurar columnas en SQLite físico de forma segura e idempotente
  try {
    $app.nonconcurrentDB()
      .newQuery("ALTER TABLE invoice_lines ADD COLUMN warehouse_id TEXT DEFAULT ''")
      .execute();
  } catch (_) {}

  try {
    $app.nonconcurrentDB()
      .newQuery("ALTER TABLE invoices ADD COLUMN inv_movement_ids TEXT DEFAULT '[]'")
      .execute();
  } catch (_) {}

  try {
    $app.nonconcurrentDB()
      .newQuery("ALTER TABLE sales_order_lines ADD COLUMN warehouse_id TEXT DEFAULT ''")
      .execute();
  } catch (_) {}

  console.log("[GRAVY-VENTAS-MULTIBODEGA] Inicialización y migración multi-bodega completada.");
});
