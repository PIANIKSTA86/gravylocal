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
    const accesses = $app.findRecordsByFilter("user_company_access", `hub_user_id = '${authRecord.id}' && active = true`, "", 50, 0);
    
    const results = [];
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
          company_pass:  acc.getString("company_pass"),
          modules:       modules
        });
      } catch (err) {
        console.log("[GRAVY HUB] Error procesando acceso a empresa:", err);
      }
    }

    e.json(200, { companies: results });
  } catch (err) {
    e.json(500, { message: "Error interno del HUB: " + String(err) });
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
  // Default temp password for syncing. In real app, user should provide or reset.
  const creatorPass = "Admin1234!";

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
