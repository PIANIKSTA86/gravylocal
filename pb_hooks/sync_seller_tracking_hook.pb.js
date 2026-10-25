/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — sync_seller_tracking_hook.pb.js
 * Sincroniza automáticamente `seller_live_locations` y mantiene activa la sesión
 * del vendedor en tiempo real cuando la app móvil envía telemetría.
 * Corrige y normaliza la atribución de vendedor (seller_id) y estado (status).
 */

function getAuthUser(e) {
  try {
    return e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  } catch (_) {
    return null;
  }
}

function resolveSellerForUser(userRecord) {
  if (!userRecord) return null;
  const userEmail = userRecord.getString("email") || "";
  const userName = userRecord.getString("name") || "";
  const userId = userRecord.id;

  // 1. Buscar por email en third_parties
  if (userEmail) {
    try {
      const tp = $app.findFirstRecordByFilter("third_parties", "email = {:email} || email2 = {:email}", { email: userEmail });
      if (tp) return tp;
    } catch (_) {}
  }

  // 2. Buscar por advisor = user.id en third_parties
  try {
    const tp = $app.findFirstRecordByFilter("third_parties", "advisor = {:uid}", { uid: userId });
    if (tp) return tp;
  } catch (_) {}

  // 3. Buscar por nombre aproximado
  if (userName) {
    try {
      const tp = $app.findFirstRecordByFilter("third_parties", "name = {:name}", { name: userName });
      if (tp) return tp;
    } catch (_) {}
  }

  return null;
}

// Interceptar creación de logs de telemetría (seller_tracking_logs)
onRecordCreateRequest((e) => {
  const log = e.record;
  const authUser = getAuthUser(e);
  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

  // Normalizar status
  let rawStatus = (log.getString("status") || "EN_TRANSITO").toUpperCase();
  if (rawStatus === "EN_RUTA" || rawStatus === "PENDING" || !rawStatus) {
    log.set("status", "EN_TRANSITO");
  }

  if (authUser) {
    // Mantener la sesión activa en tiempo real mientras el móvil reporte
    try {
      authUser.set("last_activity_at", nowStr);
      $app.save(authUser);
    } catch (_) {}

    // Validar y corregir seller_id si no coincide con el usuario autenticado
    const sellerTp = resolveSellerForUser(authUser);
    if (sellerTp) {
      const currentSellerId = log.getString("seller_id");
      if (!currentSellerId || currentSellerId !== sellerTp.id) {
        log.set("seller_id", sellerTp.id);
      }
    }
  }

  e.next();
}, "seller_tracking_logs");

// Sincronizar hacia seller_live_locations tras crear log en seller_tracking_logs
onRecordAfterCreateSuccess((e) => {
  const log = e.record;
  const sellerId = log.getString("seller_id");
  if (!sellerId) return;

  try {
    const sllCol = $app.findCollectionByNameOrId("seller_live_locations");
    let liveRec = null;
    try {
      liveRec = $app.findFirstRecordByFilter("seller_live_locations", "seller_id = {:sId}", { sId: sellerId });
    } catch (_) {}

    let rawStatus = (log.getString("status") || "EN_TRANSITO").toUpperCase();
    let status = "EN_TRANSITO";
    if (rawStatus === "EN_VISITA") status = "EN_VISITA";
    else if (rawStatus === "DETENIDO") status = "DETENIDO";
    else if (rawStatus === "OFFLINE") status = "OFFLINE";
    else status = "EN_TRANSITO";

    let sellerName = "";
    try {
      const seller = $app.findRecordById("third_parties", sellerId);
      sellerName = seller.getString("name") || "";
    } catch (_) {}

    const authUser = getAuthUser(e);
    const userId = authUser ? authUser.id : "";

    if (liveRec) {
      liveRec.set("lat", log.get("lat"));
      liveRec.set("lng", log.get("lng"));
      liveRec.set("speed", log.get("speed") || 0);
      liveRec.set("status", status);
      liveRec.set("last_ping", log.getString("timestamp") || new Date().toISOString());
      if (sellerName) liveRec.set("seller_name", sellerName);
      if (userId) liveRec.set("user_id", userId);
      $app.save(liveRec);
    } else {
      const newRec = new Record(sllCol);
      newRec.set("seller_id", sellerId);
      newRec.set("seller_name", sellerName || "Vendedor");
      if (userId) newRec.set("user_id", userId);
      newRec.set("lat", log.get("lat"));
      newRec.set("lng", log.get("lng"));
      newRec.set("speed", log.get("speed") || 0);
      newRec.set("status", status);
      newRec.set("last_ping", log.getString("timestamp") || new Date().toISOString());
      $app.save(newRec);
    }
  } catch (err) {
    console.log("[GRAVY-TRACKING-HOOK] Error sincronizando seller_live_locations: " + err);
  }
}, "seller_tracking_logs");

// Interceptar escrituras directas a seller_live_locations (móvil)
onRecordCreateRequest((e) => {
  const rec = e.record;
  const authUser = getAuthUser(e);
  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

  let rawStatus = (rec.getString("status") || "EN_TRANSITO").toUpperCase();
  if (rawStatus === "EN_RUTA" || rawStatus === "PENDING" || !rawStatus) {
    rec.set("status", "EN_TRANSITO");
  }

  if (authUser) {
    rec.set("user_id", authUser.id);
    try {
      authUser.set("last_activity_at", nowStr);
      $app.save(authUser);
    } catch (_) {}

    const sellerTp = resolveSellerForUser(authUser);
    if (sellerTp) {
      rec.set("seller_id", sellerTp.id);
      rec.set("seller_name", sellerTp.getString("name"));
    }
  }

  e.next();
}, "seller_live_locations");

onRecordUpdateRequest((e) => {
  const rec = e.record;
  const authUser = getAuthUser(e);
  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

  let rawStatus = (rec.getString("status") || "EN_TRANSITO").toUpperCase();
  if (rawStatus === "EN_RUTA" || rawStatus === "PENDING" || !rawStatus) {
    rec.set("status", "EN_TRANSITO");
  }

  if (authUser) {
    try {
      authUser.set("last_activity_at", nowStr);
      $app.save(authUser);
    } catch (_) {}
  }

  e.next();
}, "seller_live_locations");
