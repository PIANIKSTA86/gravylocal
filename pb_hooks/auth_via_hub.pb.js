/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY SSO — Intercambio de Tokens (Token Exchange)
 * Permite iniciar sesión en el Tenant validando el token de sesión global del HUB.
 */
routerAdd("POST", "/api/tenant/auth-via-hub", (e) => {
  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (_) {}
  }

  const hubToken = String(body.hub_token || "").trim();
  if (!hubToken) {
    e.json(400, { message: "El token del HUB (hub_token) es requerido" });
    return;
  }

  // 1. Obtener configuración local de la empresa
  let companyName = "";
  let nameError = "";
  try {
    const rec = $app.findFirstRecordByFilter("settings", "key = 'company_name'");
    companyName = rec.get("value") || rec.getString("value") || "";
  } catch (err) {
    nameError = String(err);
  }
  
  let companyNit = "";
  let nitError = "";
  try {
    const rec = $app.findFirstRecordByFilter("settings", "key = 'company_nit'");
    companyNit = rec.get("value") || rec.getString("value") || "";
  } catch (err) {
    nitError = String(err);
  }

  if (!companyNit && !companyName) {
    e.json(400, {
      message: "La base de datos local del tenant no tiene configurado el Nombre ni el NIT de la empresa en la colección 'settings'.",
      debug: {
        name_error: nameError,
        nit_error: nitError
      }
    });
    return;
  }

  // Obtener el puerto desde la cabecera Host del Request (para resolver conflictos de nombre duplicado)
  let companyPort = "";
  try {
    const host = e.request.Host || "";
    if (host.indexOf(":") !== -1) {
      companyPort = host.split(":").pop();
    }
  } catch (_) {}

  // 2. Comunicarse con el HUB de manera segura back-to-back para verificar acceso
  try {
    // Usamos el host local del HUB (8089)
    const hubUrl = "http://127.0.0.1:8089/api/hub/verify-access?company_nit=" + encodeURIComponent(companyNit) + "&company_name=" + encodeURIComponent(companyName) + "&company_port=" + encodeURIComponent(companyPort);
    
    const hubRes = $http.send({
      url: hubUrl,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + hubToken
      },
      timeout: 10 // segundos
    });

    if (hubRes.statusCode !== 200) {
      let errData = {};
      try { errData = JSON.parse(hubRes.raw); } catch (_) {}
      e.json(hubRes.statusCode, {
        message: errData.message || "Error al verificar el acceso en el HUB",
        debug: {
          hub_status: hubRes.statusCode,
          hub_response: hubRes.raw,
          sent_nit: companyNit,
          sent_name: companyName
        }
      });
      return;
    }

    const userData = JSON.parse(hubRes.raw);
    const email = String(userData.email || "").trim().toLowerCase();
    const fullName = String(userData.fullName || "").trim();
    const role = String(userData.role || "viewer").trim().toLowerCase();

    if (!email) {
      e.json(500, { message: "El HUB no retornó un correo electrónico válido" });
      return;
    }

    // 3. Buscar o registrar el usuario localmente
    const usersCol = $app.findCollectionByNameOrId("users");
    let userRecord = null;

    try {
      userRecord = $app.findFirstRecordByFilter("users", "email = '" + email.replace(/'/g, "''") + "'");
      
      // Sincronizar datos del HUB con el registro local
      let needsSave = false;
      if (fullName && userRecord.getString("name") !== fullName) {
        userRecord.set("name", fullName);
        needsSave = true;
      }
      if (role && userRecord.getString("role") !== role) {
        userRecord.set("role", role);
        needsSave = true;
      }
      if (!userRecord.getBool("active")) {
        userRecord.set("active", true);
        needsSave = true;
      }
      if (needsSave) {
        $app.save(userRecord);
      }
    } catch (_) {
      // Registrar usuario por primera vez en este tenant
      userRecord = new Record(usersCol);
      userRecord.set("email", email);
      userRecord.set("name", fullName || email.split('@')[0]);
      userRecord.set("role", role);
      userRecord.set("active", true);
      userRecord.setPassword($security.randomString(35)); // Contraseña local aleatoria
      $app.save(userRecord);
      console.log("[GRAVY SSO] Creado nuevo usuario local para: " + email);
    }

    // Registrar evento de LOGIN server-side en audit_log
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      let remoteIp = "";
      try {
        remoteIp = (typeof e?.remoteIP === "function")
          ? String(e.remoteIP() || "")
          : (typeof e?.realIP === "function" ? String(e.realIP() || "") : "");
      } catch (_) {}

      const auditPayload = {
        username: email,
        user_id: userRecord.id,
        action: "LOGIN",
        entity: "sistema",
        entity_id: userRecord.id,
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19),
        details: `Inicio de sesión exitoso vía SSO/HUB para ${fullName || email} (Rol: ${role}) en ${companyName || 'empresa'}`,
        ip: remoteIp,
      };

      const logRec = new Record(auditCol, auditPayload);
      $app.save(logRec);
    } catch (auditErr) {
      console.log("[auth-via-hub Audit] Aviso:", auditErr);
    }

    // 4. Retornar la respuesta estándar de autenticación de PocketBase
    $apis.recordAuthResponse(e, userRecord, "password");

  } catch (err) {
    console.log("[GRAVY SSO] Fallo en intercambio de tokens:", err);
    e.json(500, { message: "Error interno del servidor en SSO: " + String(err) });
  }
});
