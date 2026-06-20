/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 - migrate_import_reservas.pb.js
 * Reserva de productos en importacion + pendiente por entrega + detalle estructurado de despachos.
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let salesOrdersId = "";
  let invoicesId = "";
  let productsId = "";
  let importsId = "";
  let importLinesId = "";
  let deliveriesId = "";
  let invoiceLinesId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id;
    invoicesId = $app.findCollectionByNameOrId("invoices").id;
    productsId = $app.findCollectionByNameOrId("products").id;
    importsId = $app.findCollectionByNameOrId("imports").id;
    importLinesId = $app.findCollectionByNameOrId("import_lines").id;
    deliveriesId = $app.findCollectionByNameOrId("logistica_deliveries").id;
    invoiceLinesId = $app.findCollectionByNameOrId("invoice_lines").id;
  } catch (err) {
    console.log("[GRAVY-RESERVAS-IMPORT] Error base: " + err);
    return;
  }

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // 1) Cabecera de reservas
  let reservationsId = "";
  try {
    reservationsId = $app.findCollectionByNameOrId("sales_reservations").id;
  } catch (_) {
    try {
      const col = new Collection({
        name: "sales_reservations",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "number", type: "text", required: true },
          { name: "customer_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "sales_order_id", type: "relation", required: false, collectionId: salesOrdersId, cascadeDelete: false, maxSelect: 1 },
          { name: "invoice_id", type: "relation", required: false, collectionId: invoicesId, cascadeDelete: false, maxSelect: 1 },
          { name: "status", type: "select", required: true, values: ["active", "partial", "completed", "released", "cancelled"] },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_sales_reservations_number ON sales_reservations (number)"
        ]
      });
      $app.save(col);
      reservationsId = col.id;
      console.log("[GRAVY-RESERVAS-IMPORT] Coleccion sales_reservations creada.");
    } catch (err) {
      console.log("[GRAVY-RESERVAS-IMPORT] Error al crear sales_reservations: " + err);
    }
  }

  // 2) Lineas de reserva
  try {
    $app.findCollectionByNameOrId("sales_reservation_lines");
  } catch (_) {
    try {
      if (!reservationsId) reservationsId = $app.findCollectionByNameOrId("sales_reservations").id;
      const col = new Collection({
        name: "sales_reservation_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "reservation_id", type: "relation", required: true, collectionId: reservationsId, cascadeDelete: true, maxSelect: 1 },
          { name: "line_order", type: "number", required: false, min: 0 },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, cascadeDelete: false, maxSelect: 1 },
          { name: "import_id", type: "relation", required: false, collectionId: importsId, cascadeDelete: false, maxSelect: 1 },
          { name: "import_line_id", type: "relation", required: false, collectionId: importLinesId, cascadeDelete: false, maxSelect: 1 },
          { name: "qty_reserved", type: "number", required: true, min: 0 },
          { name: "qty_dispatched", type: "number", required: false, min: 0 },
          { name: "qty_released", type: "number", required: false, min: 0 },
          { name: "eta_snapshot", type: "text", required: false },
          { name: "status", type: "select", required: true, values: ["active", "partial", "completed", "released", "cancelled"] },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
      });
      $app.save(col);
      console.log("[GRAVY-RESERVAS-IMPORT] Coleccion sales_reservation_lines creada.");
    } catch (err) {
      console.log("[GRAVY-RESERVAS-IMPORT] Error al crear sales_reservation_lines: " + err);
    }
  }

  // 3) Detalle estructurado de entregas
  try {
    $app.findCollectionByNameOrId("logistica_delivery_lines");
  } catch (_) {
    try {
      const col = new Collection({
        name: "logistica_delivery_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "delivery_id", type: "relation", required: true, collectionId: deliveriesId, cascadeDelete: true, maxSelect: 1 },
          { name: "line_order", type: "number", required: false, min: 0 },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, cascadeDelete: false, maxSelect: 1 },
          { name: "invoice_line_id", type: "relation", required: false, collectionId: invoiceLinesId, cascadeDelete: false, maxSelect: 1 },
          { name: "reservation_line_id", type: "relation", required: false, collectionId: $app.findCollectionByNameOrId("sales_reservation_lines").id, cascadeDelete: false, maxSelect: 1 },
          { name: "qty_planned", type: "number", required: true, min: 0 },
          { name: "qty_delivered", type: "number", required: false, min: 0 },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
      });
      $app.save(col);
      console.log("[GRAVY-RESERVAS-IMPORT] Coleccion logistica_delivery_lines creada.");
    } catch (err) {
      console.log("[GRAVY-RESERVAS-IMPORT] Error al crear logistica_delivery_lines: " + err);
    }
  }

  // 4) Extender invoices y sales_orders
  try {
    const invCol = $app.findCollectionByNameOrId("invoices");
    const invFields = new Set(invCol.fields.fieldNames());
    let changedInv = false;

    if (!invFields.has("has_pending_delivery")) {
      invCol.fields.add(new BoolField({ name: "has_pending_delivery", required: false }));
      changedInv = true;
      console.log("[GRAVY-RESERVAS-IMPORT] Campo has_pending_delivery agregado a invoices.");
    }

    if (!invFields.has("delivery_fulfillment_status")) {
      invCol.fields.add(new SelectField({
        name: "delivery_fulfillment_status",
        required: false,
        values: ["PENDIENTE", "PARCIAL", "ENTREGADO", "NO_REQUIERE"]
      }));
      changedInv = true;
      console.log("[GRAVY-RESERVAS-IMPORT] Campo delivery_fulfillment_status agregado a invoices.");
    }

    if (changedInv) $app.save(invCol);
  } catch (err) {
    console.log("[GRAVY-RESERVAS-IMPORT] Error al extender invoices: " + err);
  }

  try {
    const soCol = $app.findCollectionByNameOrId("sales_orders");
    const soFields = new Set(soCol.fields.fieldNames());
    let changedSo = false;

    if (!soFields.has("has_pending_delivery")) {
      soCol.fields.add(new BoolField({ name: "has_pending_delivery", required: false }));
      changedSo = true;
      console.log("[GRAVY-RESERVAS-IMPORT] Campo has_pending_delivery agregado a sales_orders.");
    }

    if (!soFields.has("fulfillment_status")) {
      soCol.fields.add(new SelectField({
        name: "fulfillment_status",
        required: false,
        values: ["SIN_GESTION", "RESERVADO_IMPORTACION", "PENDIENTE_ENTREGA", "PARCIAL_ENTREGADO", "ENTREGADO"]
      }));
      changedSo = true;
      console.log("[GRAVY-RESERVAS-IMPORT] Campo fulfillment_status agregado a sales_orders.");
    }

    if (changedSo) $app.save(soCol);
  } catch (err) {
    console.log("[GRAVY-RESERVAS-IMPORT] Error al extender sales_orders: " + err);
  }

  // 5) Semilla de consecutivo de reservas
  try {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    try {
      $app.findFirstRecordByFilter("settings", 'key="sales_reservation_consecutive"');
    } catch (_) {
      const seed = new Record(settingsCol, { key: "sales_reservation_consecutive", value: "0" });
      $app.save(seed);
      console.log("[GRAVY-RESERVAS-IMPORT] Semilla sales_reservation_consecutive inicializada en 0.");
    }
  } catch (err) {
    console.log("[GRAVY-RESERVAS-IMPORT] Aviso al sembrar consecutivo: " + err);
  }

  try {
    $app.nonconcurrentDB().newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_reservations_number ON sales_reservations (number)").execute();
  } catch (_) {}

  console.log("[GRAVY-RESERVAS-IMPORT] Migracion de reservas de importacion completada.");
});
