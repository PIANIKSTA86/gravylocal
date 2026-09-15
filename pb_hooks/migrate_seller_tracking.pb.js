/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_seller_tracking.pb.js
 * Crea y asegura las colecciones `seller_live_locations` y `seller_tracking_logs`
 * para el monitoreo telemétrico y satelital en tiempo real de la fuerza de ventas.
 * También agrega los campos geoespaciales a `third_parties` (clientes).
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let usersId = "";
  let vendorVisitsId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
  } catch (err) {
    console.log("[GRAVY-TRACKING] Error: no se pudo obtener la colección third_parties: " + err);
    return;
  }

  try {
    usersId = $app.findCollectionByNameOrId("users").id;
  } catch (_) {}

  try {
    vendorVisitsId = $app.findCollectionByNameOrId("vendor_visits").id;
  } catch (_) {}

  // 1. Agregar campos geoespaciales a third_parties si no existen
  try {
    const tpCol = $app.findCollectionByNameOrId("third_parties");
    const existing = new Set(tpCol.fields.fieldNames());
    let tpChanged = false;

    if (!existing.has("geo_lat")) {
      tpCol.fields.add(new Field({ name: "geo_lat", type: "number", required: false }));
      tpChanged = true;
    }
    if (!existing.has("geo_lng")) {
      tpCol.fields.add(new Field({ name: "geo_lng", type: "number", required: false }));
      tpChanged = true;
    }
    if (!existing.has("geo_radius")) {
      tpCol.fields.add(new Field({ name: "geo_radius", type: "number", required: false, min: 10 }));
      tpChanged = true;
    }

    if (tpChanged) {
      $app.save(tpCol);
      console.log("[GRAVY-TRACKING] Campos geo agregados a third_parties.");
    }
  } catch (err) {
    console.log("[GRAVY-TRACKING] Error actualizando third_parties: " + err);
  }

  const readRule = "@request.auth.id != ''";
  const writeRule = "@request.auth.id != ''";
  const adminDeleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";

  // 2. Colección seller_live_locations (Último estado instantáneo - 1 registro por vendedor)
  try {
    $app.findCollectionByNameOrId("seller_live_locations");
  } catch (_) {
    try {
      const sll = new Collection({
        name: "seller_live_locations",
        type: "base",
        listRule: readRule,
        viewRule: readRule,
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: adminDeleteRule,
        fields: [
          { name: "seller_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "user_id", type: "relation", required: false, collectionId: usersId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "seller_name", type: "text", required: false },
          { name: "lat", type: "number", required: true },
          { name: "lng", type: "number", required: true },
          { name: "accuracy", type: "number", required: false },
          { name: "speed", type: "number", required: false },
          { name: "heading", type: "number", required: false },
          { name: "battery_level", type: "number", required: false },
          { name: "is_charging", type: "bool", required: false },
          { name: "status", type: "select", required: true, values: ["EN_VISITA", "EN_TRANSITO", "DETENIDO", "OFFLINE"] },
          { name: "current_visit_id", type: "relation", required: false, collectionId: vendorVisitsId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "last_ping", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_sll_seller ON seller_live_locations (seller_id)",
          "CREATE INDEX idx_sll_status ON seller_live_locations (status)"
        ]
      });
      $app.save(sll);
      console.log("[GRAVY-TRACKING] Colección seller_live_locations creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-TRACKING] Error al crear seller_live_locations: " + err);
    }
  }

  // 3. Colección seller_tracking_logs (Histórico de rastro del día para auditoría y trazado)
  try {
    $app.findCollectionByNameOrId("seller_tracking_logs");
  } catch (_) {
    try {
      const stl = new Collection({
        name: "seller_tracking_logs",
        type: "base",
        listRule: readRule,
        viewRule: readRule,
        createRule: writeRule,
        updateRule: null, // Los logs históricos son inmutables
        deleteRule: adminDeleteRule,
        fields: [
          { name: "seller_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "visit_date", type: "text", required: true },
          { name: "lat", type: "number", required: true },
          { name: "lng", type: "number", required: true },
          { name: "speed", type: "number", required: false },
          { name: "status", type: "text", required: false },
          { name: "timestamp", type: "text", required: true },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false }
        ],
        indexes: [
          "CREATE INDEX idx_stl_seller_date ON seller_tracking_logs (seller_id, visit_date)"
        ]
      });
      $app.save(stl);
      console.log("[GRAVY-TRACKING] Colección seller_tracking_logs creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-TRACKING] Error al crear seller_tracking_logs: " + err);
    }
  }
});
