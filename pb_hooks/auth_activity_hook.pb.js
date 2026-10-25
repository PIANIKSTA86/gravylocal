/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — auth_activity_hook.pb.js
 * Registra automáticamente el ingreso (login) y telemetría de actividad en tiempo real
 * para usuarios que inician sesión desde aplicaciones móviles (Flutter/Android/iOS)
 * o directamente mediante PocketBase authWithPassword y authRefresh.
 */

// 1. Interceptar inicio de sesión con contraseña (móvil y web directa)
onRecordAuthWithPasswordRequest((e) => {
  e.next();

  if (e.record && e.record.collection().name === "users") {
    try {
      const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);
      e.record.set("last_login_at", nowStr);
      e.record.set("last_activity_at", nowStr);

      let remoteIp = "";
      try {
        remoteIp = (typeof e.remoteIP === "function")
          ? String(e.remoteIP() || "")
          : (typeof e.realIP === "function" ? String(e.realIP() || "") : "");
      } catch (_) {}

      if (remoteIp) {
        e.record.set("last_login_ip", remoteIp);
      }

      if (!e.record.getString("active_session_id") || e.record.getString("active_session_id").startsWith("revoked_")) {
        e.record.set("active_session_id", $security.randomString(32));
      }

      $app.save(e.record);
      console.log(`[GRAVY-AUTH] Telemetría de login registrada para usuario: ${e.record.getString("email")} (IP: ${remoteIp})`);
    } catch (err) {
      console.log("[GRAVY-AUTH] Error actualizando telemetría de login: " + err);
    }
  }
}, "users");

// 2. Interceptar renovación de token (authRefresh)
onRecordAuthRefreshRequest((e) => {
  e.next();

  if (e.record && e.record.collection().name === "users") {
    try {
      const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);
      e.record.set("last_activity_at", nowStr);
      $app.save(e.record);
    } catch (_) {}
  }
}, "users");
