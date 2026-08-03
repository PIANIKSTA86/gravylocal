/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_pedidos.pb.js
 * Módulo de Pedidos y Cotizaciones.
 * Crea las colecciones sales_orders y sales_order_lines, y añade la relación sales_order_id en invoices.
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let warehousesId = "";
  let productsId = "";
  let accountsId = "";
  let invoicesId = "";
  let usersId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    warehousesId = $app.findCollectionByNameOrId("warehouses").id;
    productsId = $app.findCollectionByNameOrId("products").id;
    accountsId = $app.findCollectionByNameOrId("accounts").id;
    invoicesId = $app.findCollectionByNameOrId("invoices").id;
    usersId = $app.findCollectionByNameOrId("users").id;
  } catch (err) {
    console.log("[GRAVY-PEDIDOS] Error: no se pudieron obtener colecciones base: " + err);
    return;
  }

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: sales_orders (Cabecera de Pedidos)
  // ──────────────────────────────────────────────────────────
  let salesOrdersId = "";
  try {
    salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id;
  } catch (_) {
    try {
      const salesOrders = new Collection({
        name: "sales_orders",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "number", type: "text", required: true },
          { name: "customer_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false },
          { name: "warehouse_id", type: "relation", required: false, collectionId: warehousesId, cascadeDelete: false },
          { name: "date", type: "text", required: true },
          { name: "due_date", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "subtotal", type: "number", required: false, min: 0 },
          { name: "iva_total", type: "number", required: false, min: 0 },
          { name: "discount_amount", type: "number", required: false, min: 0 },
          { name: "total", type: "number", required: false, min: 0 },
          { name: "status", type: "select", required: true, values: ["pending", "invoiced", "cancelled"] },
          { name: "invoice_id", type: "relation", required: false, collectionId: invoicesId, cascadeDelete: false },
          { name: "user_id", type: "relation", required: true, collectionId: usersId, cascadeDelete: false }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_sales_ord_number ON sales_orders (number)"]
      });
      $app.save(salesOrders);
      salesOrdersId = salesOrders.id;
      console.log("[GRAVY-PEDIDOS] Colección sales_orders creada.");
    } catch (err) {
      console.log("[GRAVY-PEDIDOS] Error al crear sales_orders: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: sales_order_lines (Líneas de Pedido)
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("sales_order_lines");
  } catch (_) {
    try {
      if (!salesOrdersId) {
        try { salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id; } catch (_) {}
      }
      const salesOrderLines = new Collection({
        name: "sales_order_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "sales_order_id", type: "relation", required: true, collectionId: salesOrdersId, cascadeDelete: true },
          { name: "line_order", type: "number", required: false },
          { name: "product_id", type: "relation", required: false, collectionId: productsId, cascadeDelete: false },
          { name: "account_id", type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
          { name: "description", type: "text", required: false },
          { name: "qty", type: "number", required: true, min: 0 },
          { name: "unit_price", type: "number", required: true, min: 0 },
          { name: "iva_rate", type: "number", required: false, min: 0 },
          { name: "iva_amount", type: "number", required: false, min: 0 },
          { name: "subtotal", type: "number", required: false, min: 0 },
          { name: "total", type: "number", required: false, min: 0 }
        ]
      });
      $app.save(salesOrderLines);
      console.log("[GRAVY-PEDIDOS] Colección sales_order_lines creada.");
    } catch (err) {
      console.log("[GRAVY-PEDIDOS] Error al crear sales_order_lines: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. EXTENDER COLECCIÓN invoices CON RELACIÓN A sales_orders
  // ──────────────────────────────────────────────────────────
  try {
    if (!salesOrdersId) {
      try { salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id; } catch (_) {}
    }
    const invCol = $app.findCollectionByNameOrId("invoices");
    const existingFields = new Set(invCol.fields.fieldNames());
    if (!existingFields.has("sales_order_id")) {
      invCol.fields.add(new RelationField({
        name: "sales_order_id",
        required: false,
        collectionId: salesOrdersId,
        cascadeDelete: false,
        maxSelect: 1
      }));
      $app.save(invCol);
      console.log("[GRAVY-PEDIDOS] Campo sales_order_id agregado a invoices.");
    }
  } catch (err) {
    console.log("[GRAVY-PEDIDOS] Error al extender coleccion invoices: " + err);
  }

  // Sembrar número inicial consecutivo para pedidos (si no existe configuración)
  try {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    try {
      $app.findFirstRecordByFilter("settings", 'key="order_consecutive"');
    } catch (_) {
      const orderConsecutive = new Record(settingsCol, { key: "order_consecutive", value: "0" });
      $app.save(orderConsecutive);
      console.log("[GRAVY-PEDIDOS] Semilla order_consecutive inicializada en 0.");
    }
  } catch (err) {
    console.log("[GRAVY-PEDIDOS] Aviso al sembrar consecutivo de pedidos: " + err);
  }

  // Crear índice único en sales_orders si no se creó
  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_ord_number ON sales_orders (number)")
      .execute();
  } catch (_) {}

  console.log("[GRAVY-PEDIDOS] Migración de Pedidos y Cotizaciones completa.");
});
