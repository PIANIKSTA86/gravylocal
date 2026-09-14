/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — session_heartbeat.pb.js
 * Endpoint autenticado de latido (heartbeat) para validación de sesión activa única.
 * Permite detectar si la sesión fue desplazada por otro equipo de la red.
 */

routerAdd("POST", "/api/session/heartbeat", (e) => {
  let authRecord = null;
  try {
    authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  } catch (_) {}

  if (!authRecord) {
    e.json(401, {
      code: "SESSION_DISPLACED",
      message: "Tu sesión ha sido revocada porque se inició sesión en otro equipo de la red o tu token caducó."
    });
    return;
  }

  try {
    const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);
    authRecord.set("last_activity_at", nowStr);
    $app.save(authRecord);

    e.json(200, {
      status: "ok",
      active_session_id: authRecord.getString("active_session_id") || "",
      last_login_ip: authRecord.getString("last_login_ip") || "",
      last_login_at: authRecord.getString("last_login_at") || "",
      user_id: authRecord.id,
      server_time: nowStr
    });
  } catch (err) {
    e.json(500, { message: "Error al actualizar heartbeat de sesión: " + String(err) });
  }
}, $apis.requireAuth());

// Middleware global para interceptar tokens (desactivado temporalmente para no interferir con la cadena de Echo router)
/*
routerUse((next) => (e) => {
  return next(e);
});
*/



