/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_vendor_visits.pb.js
 * Crea y asegura la colección `vendor_visits` para la planeación y control de rutas de vendedores en Logística y Móvil.
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let salesOrdersId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
  } catch (err) {
    console.log("[GRAVY-VENDOR-VISITS] Error: no se pudo obtener la colección third_parties: " + err);
    return;
  }

  try {
    salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id;
  } catch (_) {}

  const readRule = "@request.auth.id != ''";
  const writeRule = "@request.auth.id != ''";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";

  let vendorVisitsId = "";
  try {
    vendorVisitsId = $app.findCollectionByNameOrId("vendor_visits").id;
  } catch (_) {
    try {
      const vendorVisits = new Collection({
        name: "vendor_visits",
        type: "base",
        listRule: readRule,
        viewRule: readRule,
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "seller_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "client_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "visit_date", type: "text", required: true },
          { name: "order_seq", type: "number", required: false, min: 1 },
          { name: "status", type: "select", required: true, values: ["PROGRAMADA", "EN_CURSO", "COMPLETADA_PEDIDO", "COMPLETADA_RECAUDO", "NO_EFECTIVA", "REPROGRAMADA"] },
          { name: "objective", type: "select", required: false, values: ["VENTA", "COBRO", "SEGUIMIENTO", "PROSPECCION"] },
          { name: "checkin_time", type: "text", required: false },
          { name: "checkout_time", type: "text", required: false },
          { name: "geo_lat", type: "number", required: false },
          { name: "geo_lng", type: "number", required: false },
          { name: "sales_order_id", type: "relation", required: false, collectionId: salesOrdersId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "no_order_reason", type: "select", required: false, values: ["STOCK_SUFICIENTE", "LOCAL_CERRADO", "ENCARGADO_NO_DISPONIBLE", "PRECIO", "OTRO"] },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ],
        indexes: [
          "CREATE INDEX idx_vv_seller_date ON vendor_visits (seller_id, visit_date)",
          "CREATE INDEX idx_vv_status ON vendor_visits (status)"
        ]
      });
      $app.save(vendorVisits);
      vendorVisitsId = vendorVisits.id;
      console.log("[GRAVY-VENDOR-VISITS] Colección vendor_visits creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-VENDOR-VISITS] Error al crear vendor_visits: " + err);
    }
  }
});
