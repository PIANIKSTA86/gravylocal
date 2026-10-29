/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — sync_seller_tracking_hook.pb.js
 * Sincroniza automáticamente `seller_live_locations` y mantiene activa la sesión
 * del vendedor en tiempo real cuando la app móvil envía telemetría.
 * Corrige y normaliza la atribución de vendedor (seller_id) y estado (status).
 */

// Helpers globales y exportados
function _gravyGetAuthUser(e) {
  try {
    if (!e) return null;
    if (e.auth) return e.auth;
    if (typeof e.requestInfo === "function") {
      const info = e.requestInfo();
      if (info && info.auth) return info.auth;
    }
    if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
      const info = $apis.requestInfo(e);
      if (info && (info.authRecord || info.auth)) return info.authRecord || info.auth;
    }
  } catch (_) {}
  return null;
}

function _gravyResolveSellerForUser(userRecord) {
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
  if (userId) {
    try {
      const tp = $app.findFirstRecordByFilter("third_parties", "advisor = {:uid}", { uid: userId });
      if (tp) return tp;
    } catch (_) {}
  }

  // 3. Buscar por nombre aproximado
  if (userName) {
    try {
      const tp = $app.findFirstRecordByFilter("third_parties", "name = {:name}", { name: userName });
      if (tp) return tp;
    } catch (_) {}
  }

  // 4. Buscar por coincidencia de apellido / username en email
  try {
    const handle = (userEmail.split("@")[0] || "").toLowerCase();
    if (handle.length >= 3) {
      const candidates = $app.findRecordsByFilter("third_parties", "type = 'EMPLEADO' || type = 'VENDEDOR'", "", 50, 0);
      for (let c of candidates) {
        if (!c) continue;
        const cName = (c.getString("name") || "").toLowerCase();
        if (cName.includes(handle.slice(1)) || cName.includes(handle)) {
          return c;
        }
      }
    }
  } catch (_) {}

  return null;
}

// 1. Interceptar creación de logs de telemetría (seller_tracking_logs)
onRecordCreateRequest((e) => {
  const log = e.record;
  if (!log) return e.next();

  const authUser = (typeof _gravyGetAuthUser === "function" ? _gravyGetAuthUser(e) : null) || (function(ev) {
    try {
      if (!ev) return null;
      if (ev.auth) return ev.auth;
      if (typeof ev.requestInfo === "function") {
        const info = ev.requestInfo();
        if (info && info.auth) return info.auth;
      }
      if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
        const info = $apis.requestInfo(ev);
        if (info && (info.authRecord || info.auth)) return info.authRecord || info.auth;
      }
    } catch (_) {}
    return null;
  })(e);

  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

  // Normalizar status
  let rawStatus = (log.getString("status") || "EN_TRANSITO").toUpperCase();
  if (rawStatus === "EN_RUTA" || rawStatus === "PENDING" || !rawStatus) {
    log.set("status", "EN_TRANSITO");
  }

  if (authUser) {
    // Mantener la sesión activa en tiempo real mientras el móvil reporte
    try {
      $app.db().newQuery("UPDATE users SET last_activity_at = {:now} WHERE id = {:id}").bind({ now: nowStr, id: authUser.id }).execute();
    } catch (_) {}

    // Validar y corregir seller_id si no coincide con el usuario autenticado
    const sellerTp = (typeof _gravyResolveSellerForUser === "function" ? _gravyResolveSellerForUser(authUser) : null) || (function(u) {
      if (!u) return null;
      const em = u.getString("email") || "";
      const uid = u.id;
      if (em) {
        try {
          const tp = $app.findFirstRecordByFilter("third_parties", "email = {:email} || email2 = {:email}", { email: em });
          if (tp) return tp;
        } catch (_) {}
      }
      if (uid) {
        try {
          const tp = $app.findFirstRecordByFilter("third_parties", "advisor = {:uid}", { uid: uid });
          if (tp) return tp;
        } catch (_) {}
      }
      return null;
    })(authUser);

    if (sellerTp) {
      const currentSellerId = log.getString("seller_id");
      if (!currentSellerId || currentSellerId !== sellerTp.id) {
        log.set("seller_id", sellerTp.id);
      }
    }
  }

  return e.next();
}, "seller_tracking_logs");

// 2. Sincronizar hacia seller_live_locations tras crear log en seller_tracking_logs
onRecordAfterCreateSuccess((e) => {
  const log = e.record;
  if (!log) return;

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

    const authUser = (typeof _gravyGetAuthUser === "function" ? _gravyGetAuthUser(e) : null) || (function(ev) {
      try {
        if (!ev) return null;
        if (ev.auth) return ev.auth;
        if (typeof ev.requestInfo === "function") {
          const info = ev.requestInfo();
          if (info && info.auth) return info.auth;
        }
        if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
          const info = $apis.requestInfo(ev);
          if (info && (info.authRecord || info.auth)) return info.authRecord || info.auth;
        }
      } catch (_) {}
      return null;
    })(e);

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

// 3. Interceptar escrituras directas a seller_live_locations (móvil)
onRecordCreateRequest((e) => {
  const rec = e.record;
  if (!rec) return e.next();

  const authUser = (typeof _gravyGetAuthUser === "function" ? _gravyGetAuthUser(e) : null) || (function(ev) {
    try {
      if (!ev) return null;
      if (ev.auth) return ev.auth;
      if (typeof ev.requestInfo === "function") {
        const info = ev.requestInfo();
        if (info && info.auth) return info.auth;
      }
      if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
        const info = $apis.requestInfo(ev);
        if (info && (info.authRecord || info.auth)) return info.authRecord || info.auth;
      }
    } catch (_) {}
    return null;
  })(e);

  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

  let rawStatus = (rec.getString("status") || "EN_TRANSITO").toUpperCase();
  if (rawStatus === "EN_RUTA" || rawStatus === "PENDING" || !rawStatus) {
    rec.set("status", "EN_TRANSITO");
  }

  if (authUser) {
    rec.set("user_id", authUser.id);
    try {
      $app.db().newQuery("UPDATE users SET last_activity_at = {:now} WHERE id = {:id}").bind({ now: nowStr, id: authUser.id }).execute();
    } catch (_) {}

    const sellerTp = (typeof _gravyResolveSellerForUser === "function" ? _gravyResolveSellerForUser(authUser) : null) || (function(u) {
      if (!u) return null;
      const em = u.getString("email") || "";
      const uid = u.id;
      if (em) {
        try {
          const tp = $app.findFirstRecordByFilter("third_parties", "email = {:email} || email2 = {:email}", { email: em });
          if (tp) return tp;
        } catch (_) {}
      }
      if (uid) {
        try {
          const tp = $app.findFirstRecordByFilter("third_parties", "advisor = {:uid}", { uid: uid });
          if (tp) return tp;
        } catch (_) {}
      }
      return null;
    })(authUser);

    if (sellerTp) {
      rec.set("seller_id", sellerTp.id);
      rec.set("seller_name", sellerTp.getString("name"));
    }
  }

  return e.next();
}, "seller_live_locations");

// 4. Interceptar actualizaciones de seller_live_locations (móvil PATCH)
onRecordUpdateRequest((e) => {
  const rec = e.record;
  if (!rec) return e.next();

  const authUser = (typeof _gravyGetAuthUser === "function" ? _gravyGetAuthUser(e) : null) || (function(ev) {
    try {
      if (!ev) return null;
      if (ev.auth) return ev.auth;
      if (typeof ev.requestInfo === "function") {
        const info = ev.requestInfo();
        if (info && info.auth) return info.auth;
      }
      if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
        const info = $apis.requestInfo(ev);
        if (info && (info.authRecord || info.auth)) return info.authRecord || info.auth;
      }
    } catch (_) {}
    return null;
  })(e);

  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

  let rawStatus = (rec.getString("status") || "EN_TRANSITO").toUpperCase();
  if (rawStatus === "EN_RUTA" || rawStatus === "PENDING" || !rawStatus) {
    rec.set("status", "EN_TRANSITO");
  }

  if (authUser && authUser.id) {
    try {
      $app.db().newQuery("UPDATE users SET last_activity_at = {:now} WHERE id = {:id}").bind({ now: nowStr, id: authUser.id }).execute();
    } catch (_) {}
  }

  return e.next();
}, "seller_live_locations");
