/// <reference path="../../pb_data/types.d.ts" />

/**
 * GRAVY HUB — API
 * Endpoints personalizados del HUB
 */

routerAdd("GET", "/api/hub/my-companies", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  
  if (!authRecord) {
    e.json(401, { message: "No autenticado en el HUB" });
    return;
  }

  try {
    const results = [];
    const isSuperAdmin = authRecord.getBool("is_superadmin") === true;

    if (isSuperAdmin) {
      // Si es superadmin, listar TODAS las empresas activas en el HUB
      const companies = $app.findRecordsByFilter("companies", "active = true", "", 100, 0);
      
      for (const company of companies) {
        try {
          // Intentar buscar el acceso específico de este superadmin a la empresa
          let acc = null;
          try {
            const accs = $app.findRecordsByFilter("user_company_access", `hub_user_id = '${authRecord.id}' && company_id = '${company.id}' && active = true`, "", 1, 0);
            if (accs && accs.length > 0) acc = accs[0];
          } catch (_) {}

          // Si no tiene acceso directo, buscar cualquier otro acceso para esta empresa en UCA para obtener las credenciales de conexión
          if (!acc) {
            try {
              const accs = $app.findRecordsByFilter("user_company_access", `company_id = '${company.id}' && active = true`, "", 1, 0);
              if (accs && accs.length > 0) acc = accs[0];
            } catch (_) {}
          }

          // Fetch licenses for this company
          const licRecords = $app.findRecordsByFilter("licenses", `company_id = '${company.id}' && enabled = true`, "", 50, 0);
          const modules = licRecords.map(l => l.getString("module_key"));

          results.push({
            access_id:     acc ? acc.id : `sa-auto-${company.id}`,
            company_id:    company.id,
            company_name:  company.getString("name"),
            company_url:   company.getString("url"),
            company_color: company.getString("color_theme") || "#2446B8",
            role:          isSuperAdmin ? "superadmin" : (acc ? acc.getString("role") : "viewer"),
            company_email: acc ? acc.getString("company_email") : authRecord.getString("email"),
            company_pass:  "SSO_ACTIVE", // Ocultar contraseña real
            modules:       modules
          });
        } catch (err) {
          console.log("[GRAVY HUB] Error procesando empresa para superadmin:", err);
        }
      }
    } else {
      // Para usuarios normales, listar solo las empresas a las que tienen acceso
      const accesses = $app.findRecordsByFilter("user_company_access", `hub_user_id = '${authRecord.id}' && active = true`, "", 50, 0);
      
      for (const acc of accesses) {
        try {
          const company = $app.findRecordById("companies", acc.getString("company_id"));
          if (!company.getBool("active")) continue;

          // Fetch licenses for this company
          const licRecords = $app.findRecordsByFilter("licenses", `company_id = '${company.id}' && enabled = true`, "", 50, 0);
          const modules = licRecords.map(l => l.getString("module_key"));

          results.push({
            access_id:     acc.id,
            company_id:    company.id,
            company_name:  company.getString("name"),
            company_url:   company.getString("url"),
            company_color: company.getString("color_theme") || "#2446B8",
            role:          acc.getString("role"),
            company_email: acc.getString("company_email"),
            company_pass:  "SSO_ACTIVE", // Ocultar contraseña real
            modules:       modules
          });
        } catch (err) {
          console.log("[GRAVY HUB] Error procesando acceso a empresa:", err);
        }
      }
    }

    e.json(200, { companies: results });
  } catch (err) {
    e.json(500, { message: "Error interno del HUB: " + String(err) });
  }
});

// Endpoint para verificar accesos desde los tenants individuales sin exponer contraseñas
routerAdd("GET", "/api/hub/verify-access", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  
  if (!authRecord) {
    e.json(401, { message: "No autenticado en el HUB" });
    return;
  }

  const companyNit = String(e.request.url.query().get("company_nit") || "").trim();
  const companyName = String(e.request.url.query().get("company_name") || "").trim();
  const companyPort = parseInt(e.request.url.query().get("company_port") || "0", 10);

  if (!companyNit && !companyName && !companyPort) {
    e.json(400, { message: "Se requiere company_port, company_nit o company_name" });
    return;
  }

  try {
    // 1. Buscar la empresa correspondiente en el HUB
    let company = null;
    
    // Primero, intentar buscar por puerto (único e inequívoco en desarrollo local)
    if (companyPort > 0) {
      try {
        company = $app.findFirstRecordByFilter("companies", "port = " + companyPort);
      } catch (_) {}
    }
    
    // Si no se encuentra, buscar por NIT o Nombre (fallback)
    if (!company && companyNit) {
      try {
        company = $app.findFirstRecordByFilter("companies", "nit = '" + companyNit.replace(/'/g, "''") + "'");
      } catch (_) {}
    }
    if (!company && companyName) {
      try {
        company = $app.findFirstRecordByFilter("companies", "name = '" + companyName.replace(/'/g, "''") + "'");
      } catch (_) {}
    }

    if (!company) {
      e.json(404, { message: "Empresa no encontrada en el HUB" });
      return;
    }

    if (!company.getBool("active")) {
      e.json(403, { message: "La empresa está inactiva en el HUB" });
      return;
    }

    // 2. Verificar el acceso de este usuario a la empresa
    const isSuperAdmin = authRecord.getBool("is_superadmin") === true;
    let accessRole = "";
    let companyEmail = authRecord.getString("email");

    if (isSuperAdmin) {
      // Superadmins tienen acceso completo
      accessRole = "superadmin";
      try {
        const accs = $app.findRecordsByFilter("user_company_access", "hub_user_id = '" + authRecord.id + "' && company_id = '" + company.id + "' && active = true", "", 1, 0);
        if (accs && accs.length > 0) {
          companyEmail = accs[0].getString("company_email") || companyEmail;
        }
      } catch (_) {}
    } else {
      // Usuarios normales
      try {
        const accs = $app.findRecordsByFilter("user_company_access", "hub_user_id = '" + authRecord.id + "' && company_id = '" + company.id + "' && active = true", "", 1, 0);
        if (!accs || accs.length === 0) {
          e.json(403, { message: "Acceso denegado a esta empresa" });
          return;
        }
        accessRole = accs[0].getString("role") || "viewer";
        companyEmail = accs[0].getString("company_email") || companyEmail;
      } catch (_) {
        e.json(403, { message: "Acceso denegado" });
        return;
      }
    }

    e.json(200, {
      email: companyEmail,
      fullName: authRecord.getString("full_name") || authRecord.getString("email").split('@')[0],
      role: accessRole
    });
  } catch (err) {
    e.json(500, { message: "Error interno en HUB verify-access: " + String(err) });
  }
});

// Endpoint central para apagar/encender módulos (SuperAdmin)
routerAdd("POST", "/api/hub/toggle-license", (e) => {
  let authRecord = null;
  try { authRecord = e.auth; } catch (_) {}
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }

  if (!authRecord || authRecord.getBool("is_superadmin") !== true) {
    e.json(403, { message: "Solo el SuperAdmin del HUB puede modificar licencias" });
    return;
  }

  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}
  if (!body.module_key) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }

  const companyId = String(body.company_id || "").trim();
  const moduleKey = String(body.module_key || "").trim();
  const enabled = body.enabled !== false;

  if (!companyId || !moduleKey) {
    e.json(400, { message: "Faltan parámetros" });
    return;
  }

  if (moduleKey === "core" && !enabled) {
    e.json(400, { message: "Core no puede deshabilitarse" });
    return;
  }

  try {
    const safeComp = companyId.replace(/"/g, '');
    const safeMod  = moduleKey.replace(/"/g, '');
    
    const records = $app.findRecordsByFilter("licenses", `company_id = "${safeComp}" && module_key = "${safeMod}"`, "", 1, 0);

    if (records && records.length > 0) {
      const rec = records[0];
      rec.set("enabled", enabled);
      $app.save(rec);
    } else {
      const licCol = $app.findCollectionByNameOrId("licenses");
      const rec = new Record(licCol);
      rec.set("company_id", companyId);
      rec.set("module_key", moduleKey);
      rec.set("enabled", enabled);
      rec.set("plan", "perpetua");
      $app.save(rec);
    }
    e.json(200, { ok: true, message: "Licencia actualizada exitosamente" });
  } catch (err) {
    e.json(500, { message: "Error DB: " + String(err) });
  }
});

// API para crear empresa orquestada
routerAdd("POST", "/api/hub/create-company", (e) => {
  let authRecord = null;
  try { authRecord = e.auth; } catch (_) {}
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }

  if (!authRecord || authRecord.getBool("is_superadmin") !== true) {
    e.json(403, { message: "Permiso denegado" });
    return;
  }

  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}
  if (!body.name) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }

  const name = String(body.name || "").trim();
  const nit = String(body.nit || "").trim();
  const color = String(body.color || "#2446B8").trim();
  const modules = Array.isArray(body.modules) ? body.modules : ["core"];
  const creatorEmail = authRecord.getString("email");
  // Permite contraseña dinámica enviada desde el frontend, con fallback seguro
  const creatorPass = String(body.password || "").trim() || "Admin1234!";

  if (!name) {
    e.json(400, { message: "El nombre es obligatorio" });
    return;
  }

  try {
    // LLamada HTTP interna al Orquestador (Node.js en puerto 8088)
    const orchRes = $http.send({
      url: "http://127.0.0.1:8088/api/orchestrate/create",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, nit, color, modules, email: creatorEmail, password: creatorPass
      }),
      timeout: 30 // Segundos
    });

    if (orchRes.statusCode !== 200) {
      e.json(500, { message: "Error del orquestador: " + orchRes.raw });
      return;
    }

    const orchData = JSON.parse(orchRes.raw);
    const newPort = orchData.port;
    const newUrl = orchData.url;

    // 1. Guardar la nueva Empresa en el HUB
    const companies = $app.findCollectionByNameOrId("companies");
    const newComp = new Record(companies);
    newComp.set("name", name);
    newComp.set("nit", nit);
    newComp.set("url", newUrl);
    newComp.set("port", newPort);
    newComp.set("active", true);
    newComp.set("color_theme", color);
    $app.save(newComp);

    // 2. Darle acceso al creador
    const uca = $app.findCollectionByNameOrId("user_company_access");
    const access = new Record(uca);
    access.set("hub_user_id", authRecord.id);
    access.set("company_id", newComp.id);
    access.set("role", "admin");
    access.set("company_email", creatorEmail);
    access.set("company_pass", creatorPass);
    access.set("active", true);
    $app.save(access);

    // 3. Asignar las licencias iniciales
    const licCol = $app.findCollectionByNameOrId("licenses");
    for (const mod of modules) {
      try {
        const lic = new Record(licCol);
        lic.set("company_id", newComp.id);
        lic.set("module_key", mod);
        lic.set("enabled", true);
        lic.set("plan", "perpetua");
        $app.save(lic);
      } catch (err) {
        console.log("[GRAVY HUB] Error creando licencia inicial: " + err);
      }
    }

    e.json(200, { ok: true, message: "Empresa aprovisionada con éxito", company: newComp.id });
  } catch (err) {
    e.json(500, { message: "Fallo general aprovisionando: " + String(err) });
  }
});

// Endpoint para sincronizar usuarios creados en los tenants
routerAdd("POST", "/api/hub/sync-tenant-user", (e) => {
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}
  if (!body.email) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }

  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.fullName || "").trim();
  let role = String(body.role || "viewer").trim().toLowerCase();
  const validRoles = ["admin", "contador", "auxiliar", "cajero", "auditor", "viewer", "vendedor", "propietario"];
  if (!validRoles.includes(role)) {
    if (role === "superadmin" || role === "owner") {
      role = "admin";
    } else {
      role = "viewer";
    }
  }
  const active = body.active !== false;
  const password = String(body.password || "").trim();
  const companyName = String(body.companyName || "").trim();
  const companyNit = String(body.companyNit || "").trim();

  if (!email) {
    e.json(400, { message: "El email es requerido" });
    return;
  }

  try {
    // 1. Encontrar la empresa correspondiente
    let company = null;
    if (companyNit) {
      try {
        company = $app.findFirstRecordByFilter("companies", "nit = '" + companyNit.replace(/'/g, "''") + "'");
      } catch (_) {}
    }
    if (!company && companyName) {
      try {
        company = $app.findFirstRecordByFilter("companies", "name = '" + companyName.replace(/'/g, "''") + "'");
      } catch (_) {}
    }

    if (!company) {
      // Fallback: buscar la de puerto 8090 si es la demo
      try {
        company = $app.findFirstRecordByFilter("companies", "port = 8090");
      } catch (_) {
        e.json(404, { message: "Empresa no identificada en el HUB" });
        return;
      }
    }

    // 2. Buscar o crear el usuario en hub_users
    const hubUsersCol = $app.findCollectionByNameOrId("hub_users");
    let hubUser = null;
    try {
      hubUser = $app.findFirstRecordByFilter("hub_users", "email = '" + email.replace(/'/g, "''") + "'");
      if (fullName && hubUser.getString("full_name") !== fullName) {
        hubUser.set("full_name", fullName);
      }
      if (password) {
        hubUser.setPassword(password);
      }
      $app.save(hubUser);
    } catch (_) {
      hubUser = new Record(hubUsersCol);
      hubUser.set("email", email);
      hubUser.set("full_name", fullName || email.split('@')[0]);
      hubUser.set("is_superadmin", false);
      hubUser.setPassword(password || "Admin1234!");
      $app.save(hubUser);
      console.log("[GRAVY HUB] Creado usuario hub_user para: " + email);
    }

    // 3. Crear o actualizar el acceso user_company_access
    const ucaCol = $app.findCollectionByNameOrId("user_company_access");
    let access = null;
    try {
      access = $app.findFirstRecordByFilter("user_company_access", "hub_user_id = '" + hubUser.id + "' && company_id = '" + company.id + "'");
      access.set("role", role);
      access.set("company_email", email);
      access.set("active", active);
      if (password) {
        access.set("company_pass", password);
      }
      $app.save(access);
      console.log("[GRAVY HUB] Actualizado acceso UCA para: " + email);
    } catch (_) {
      access = new Record(ucaCol);
      access.set("hub_user_id", hubUser.id);
      access.set("company_id", company.id);
      access.set("role", role);
      access.set("company_email", email);
      access.set("company_pass", password || "Admin1234!");
      access.set("active", active);
      $app.save(access);
      console.log("[GRAVY HUB] Creado acceso UCA para: " + email);
    }

    e.json(200, { 
      success: true, 
      message: "Usuario sincronizado correctamente con el HUB",
      company_pass: access.getString("company_pass")
    });
  } catch (err) {
    console.error("[GRAVY HUB] Error en sync-tenant-user:", err);
    e.json(500, { message: "Error interno del HUB: " + String(err) });
  }
});

// Endpoint para sincronizar datos de la empresa desde el tenant
routerAdd("POST", "/api/hub/sync-tenant-company", (e) => {
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}
  if (!body.company_id) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }

  const companyId = String(body.company_id || "").trim();
  const name = String(body.name || "").trim();
  const nit = String(body.nit || "").trim();

  if (!companyId) {
    e.json(400, { message: "El ID de la empresa es requerido" });
    return;
  }

  try {
    const company = $app.findRecordById("companies", companyId);
    if (name) company.set("name", name);
    if (nit) company.set("nit", nit);
    $app.save(company);
    console.log("[GRAVY HUB] Razón social y NIT actualizados en el HUB para la empresa: " + companyId);
    e.json(200, { success: true, message: "Empresa sincronizada correctamente con el HUB" });
  } catch (err) {
    console.error("[GRAVY HUB] Error en sync-tenant-company:", err);
    e.json(500, { message: "Error interno del HUB: " + String(err) });
  }
});

// Endpoint para eliminar una empresa y sus accesos/usuarios huérfanos asociados
routerAdd("POST", "/api/hub/delete-company", (e) => {
  let authRecord = null;
  try { authRecord = e.auth; } catch (_) {}
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }

  if (!authRecord || authRecord.getBool("is_superadmin") !== true) {
    e.json(403, { message: "Permiso denegado. Solo el SuperAdmin puede eliminar empresas." });
    return;
  }

  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}
  if (!body.company_id) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }

  const companyId = String(body.company_id || "").trim();
  if (!companyId) {
    e.json(400, { message: "El ID de la empresa (company_id) es requerido" });
    return;
  }

  try {
    const company = $app.findRecordById("companies", companyId);
    const port = company.getInt("port");

    // 1. Llamar al orquestador en el puerto 8088 para detener el proceso y borrar archivos físicos
    const orchRes = $http.send({
      url: "http://127.0.0.1:8088/api/orchestrate/delete",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ port }),
      timeout: 15 // segundos
    });

    if (orchRes.statusCode !== 200) {
      e.json(500, { message: "Error en el orquestador al eliminar archivos: " + orchRes.raw });
      return;
    }

    // 2. Limpiar base de datos del HUB
    // Obtener y borrar accesos de usuario para esta empresa
    const accesses = $app.findRecordsByFilter("user_company_access", `company_id = '${companyId}'`, "", 200, 0);
    for (const acc of accesses) {
      const hubUserId = acc.getString("hub_user_id");
      
      // Borrar el registro de acceso
      $app.delete(acc);
      console.log("[GRAVY HUB] Eliminado acceso de UCA para usuario ID: " + hubUserId);

      // Validar si el usuario queda huérfano (sin accesos a otras empresas)
      try {
        const otherAccesses = $app.findRecordsByFilter("user_company_access", `hub_user_id = '${hubUserId}'`, "", 1, 0);
        if (!otherAccesses || otherAccesses.length === 0) {
          const hubUser = $app.findRecordById("hub_users", hubUserId);
          // Por seguridad, nunca eliminar cuentas marcadas como superadmin global
          if (!hubUser.getBool("is_superadmin")) {
            $app.delete(hubUser);
            console.log("[GRAVY HUB] Usuario huérfano eliminado de hub_users: " + hubUser.getString("email"));
          }
        }
      } catch (err) {
        console.log("[GRAVY HUB] Error al evaluar/eliminar usuario huérfano: " + err);
      }
    }

    // Borrar licencias
    const licenses = $app.findRecordsByFilter("licenses", `company_id = '${companyId}'`, "", 100, 0);
    for (const lic of licenses) {
      $app.delete(lic);
    }
    console.log("[GRAVY HUB] Eliminadas licencias de la empresa: " + companyId);

    // Borrar el registro de la empresa
    $app.delete(company);
    console.log("[GRAVY HUB] Eliminado registro de la empresa del HUB: " + companyId);

    e.json(200, { ok: true, message: "Empresa y recursos asociados eliminados correctamente del HUB." });

  } catch (err) {
    console.error("[GRAVY HUB] Error en delete-company:", err);
    e.json(500, { message: "Error interno del HUB al eliminar la empresa: " + String(err) });
  }
});


