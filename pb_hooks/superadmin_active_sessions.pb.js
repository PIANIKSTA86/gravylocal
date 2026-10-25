/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — superadmin_active_sessions.pb.js
 * Endpoints exclusivos para SuperAdmin para auditar y gestionar sesiones activas en tiempo real.
 */

routerAdd("GET", "/api/superadmin/active-sessions", (e) => {
  const reqInfo = e.requestInfo ? e.requestInfo() : null;
  const auth = reqInfo?.auth || e.auth;

  if (!auth) {
    return e.json(401, { message: "No autenticado" });
  }

  // Validar rol superadmin o admin
  const userRoles = auth.get("role") || [];
  const isSuperAdmin = auth.getString("role") === "superadmin" || 
                       (Array.isArray(userRoles) && userRoles.includes("superadmin")) ||
                       auth.getString("email") === "admin@gravy.local" ||
                       auth.getString("email") === "admin@contaco.com";

  if (!isSuperAdmin) {
    return e.json(403, { message: "Acceso exclusivo para SuperAdministrador" });
  }

  try {
    const nowUtcMs = Date.now();
    // Hora colombiana (UTC-5)
    const nowColMs = nowUtcMs - 5 * 3600 * 1000;
    const nowStr = new Date(nowColMs).toISOString().replace("T", " ").slice(0, 19);

    const users = $app.findRecordsByFilter("users", "active = true", "-last_activity_at");
    
    // Mapear sucursales
    const branchesMap = {};
    try {
      const branches = $app.findRecordsByFilter("branches", "active = true");
      branches.forEach(b => {
        branchesMap[b.id] = b.getString("name");
      });
    } catch (_) {}

    let onlineCount = 0;
    let idleCount = 0;
    let offlineCount = 0;

    const userList = users.map(u => {
      const lastAct = u.getString("last_activity_at") || "";
      const lastLogin = u.getString("last_login_at") || "";
      const lastIp = u.getString("last_login_ip") || "";
      const activeSession = u.getString("active_session_id") || "";
      const branchId = u.getString("default_branch_id") || "";

      let status = "offline";
      let secondsAgo = null;

      const isRevoked = activeSession.startsWith("revoked_");
      if (lastAct && !isRevoked) {
        try {
          // Parsear lastAct ("YYYY-MM-DD HH:mm:ss")
          const actDateMs = Date.parse(lastAct.replace(" ", "T") + "Z");
          // Comparar con hora colombiana actual
          const colNowForAct = Date.parse(nowStr.replace(" ", "T") + "Z");
          secondsAgo = Math.max(0, Math.round((colNowForAct - actDateMs) / 1000));

          if (secondsAgo <= 180) { // Menos de 3 min
            status = "online";
            onlineCount++;
          } else if (secondsAgo <= 900) { // Entre 3 y 15 min
            status = "idle";
            idleCount++;
          } else {
            status = "offline";
            offlineCount++;
          }
        } catch (_) {
          status = "offline";
          offlineCount++;
        }
      } else {
        offlineCount++;
      }

      let roles = u.get("role");
      if (!Array.isArray(roles)) {
        roles = roles ? [roles] : [];
      }

      return {
        id: u.id,
        email: u.getString("email"),
        name: u.getString("name") || "",
        full_name: u.getString("full_name") || u.getString("name") || u.getString("email"),
        roles: roles,
        avatar: u.getString("avatar") || "",
        branch_id: branchId,
        branch_name: branchesMap[branchId] || "Principal",
        last_login_ip: lastIp,
        last_login_at: lastLogin,
        last_activity_at: lastAct,
        active_session_id: activeSession,
        status: status,
        seconds_ago: secondsAgo,
        is_current_user: u.id === auth.id
      };
    });

    return e.json(200, {
      summary: {
        total_users: users.length,
        online_count: onlineCount,
        idle_count: idleCount,
        offline_count: offlineCount,
        server_time: nowStr
      },
      users: userList
    });
  } catch (err) {
    return e.json(500, { message: "Error al consultar usuarios activos: " + String(err) });
  }
}, $apis.requireAuth());

routerAdd("POST", "/api/superadmin/terminate-session", (e) => {
  const reqInfo = e.requestInfo ? e.requestInfo() : null;
  const auth = reqInfo?.auth || e.auth;

  if (!auth) {
    return e.json(401, { message: "No autenticado" });
  }

  const userRoles = auth.get("role") || [];
  const isSuperAdmin = auth.getString("role") === "superadmin" || 
                       (Array.isArray(userRoles) && userRoles.includes("superadmin")) ||
                       auth.getString("email") === "admin@gravy.local" ||
                       auth.getString("email") === "admin@contaco.com";

  if (!isSuperAdmin) {
    return e.json(403, { message: "Acceso exclusivo para SuperAdministrador" });
  }

  try {
    const data = $apis.requestInfo(e).data || {};
    const targetUserId = data.user_id;

    if (!targetUserId) {
      return e.json(400, { message: "user_id es obligatorio" });
    }

    if (targetUserId === auth.id) {
      return e.json(400, { message: "No puedes revocar tu propia sesión de SuperAdmin actual" });
    }

    const targetUser = $app.findRecordById("users", targetUserId);
    targetUser.set("active_session_id", "revoked_" + Date.now());
    targetUser.set("last_activity_at", "");
    $app.save(targetUser);

    console.log("[GRAVY SuperAdmin] Sesión revocada forzosamente para usuario: " + targetUser.getString("email"));

    return e.json(200, {
      status: "ok",
      message: "Sesión cerrada forzosamente para " + (targetUser.getString("name") || targetUser.getString("email"))
    });
  } catch (err) {
    return e.json(500, { message: "Error al revocar sesión: " + String(err) });
  }
}, $apis.requireAuth());
