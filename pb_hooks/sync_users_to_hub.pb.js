/// <reference path="../pb_data/types.d.ts" />

// 1. Replicar al crear usuario
onRecordCreateRequest((e) => {
  const password = String(e.requestInfo()?.body?.password || "").trim();
  e.next();
  const record = e.record;
  
  try {
    const email = record.getString("email");
    if (!email) return;
    const fullName = record.getString("full_name") || record.getString("name") || email.split('@')[0];
    const role = record.getString("role") || "viewer";
    const active = record.getBool("active");
    
    let companyName = "";
    try { companyName = $app.findFirstRecordByFilter("settings", "key = 'company_name'").get("value") || ""; } catch (_) {}
    let companyNit = "";
    try { companyNit = $app.findFirstRecordByFilter("settings", "key = 'company_nit'").get("value") || ""; } catch (_) {}
    
    const payload = { email, fullName, role, active, password, companyName, companyNit };
    console.log("[GRAVY SYNC] Replicando nuevo usuario a HUB: " + email);
    const res = $http.send({
      url: "http://127.0.0.1:8089/api/hub/sync-tenant-user",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.statusCode !== 200) {
      console.log("[GRAVY SYNC] Error al sincronizar con HUB al crear: " + res.raw);
    }
  } catch (err) {
    console.log("[GRAVY SYNC] Error al sincronizar al crear: " + err);
  }
}, "users");

// 2. Replicar al actualizar usuario
onRecordUpdateRequest((e) => {
  const password = String(e.requestInfo()?.body?.password || "").trim();
  e.next();
  const record = e.record;
  
  try {
    const email = record.getString("email");
    if (!email) return;
    const fullName = record.getString("full_name") || record.getString("name") || email.split('@')[0];
    const role = record.getString("role") || "viewer";
    const active = record.getBool("active");
    
    let companyName = "";
    try { companyName = $app.findFirstRecordByFilter("settings", "key = 'company_name'").get("value") || ""; } catch (_) {}
    let companyNit = "";
    try { companyNit = $app.findFirstRecordByFilter("settings", "key = 'company_nit'").get("value") || ""; } catch (_) {}
    
    const payload = { email, fullName, role, active, password, companyName, companyNit };
    console.log("[GRAVY SYNC] Replicando actualización de usuario a HUB: " + email);
    const res = $http.send({
      url: "http://127.0.0.1:8089/api/hub/sync-tenant-user",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.statusCode !== 200) {
      console.log("[GRAVY SYNC] Error al sincronizar con HUB al actualizar: " + res.raw);
    }
  } catch (err) {
    console.log("[GRAVY SYNC] Error al sincronizar al actualizar: " + err);
  }
}, "users");

// 3. Sincronizar usuarios existentes al iniciar el servidor
onBootstrap((e) => {
  e.next();
  
  try {
    const records = $app.findRecordsByFilter("users", "email != ''", "", 200, 0);
    console.log("[GRAVY SYNC] Sincronizando " + records.length + " usuarios existentes con el HUB...");
    
    let companyName = "";
    try { companyName = $app.findFirstRecordByFilter("settings", "key = 'company_name'").get("value") || ""; } catch (_) {}
    let companyNit = "";
    try { companyNit = $app.findFirstRecordByFilter("settings", "key = 'company_nit'").get("value") || ""; } catch (_) {}
    
    for (const record of records) {
      try {
        const email = record.getString("email");
        if (!email) continue;
        const fullName = record.getString("full_name") || record.getString("name") || email.split('@')[0];
        const role = record.getString("role") || "viewer";
        const active = record.getBool("active");
        const payload = { email, fullName, role, active, password: "", companyName, companyNit };
        const res = $http.send({
          url: "http://127.0.0.1:8089/api/hub/sync-tenant-user",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.statusCode !== 200) {
          console.log("[GRAVY SYNC] Error al sincronizar usuario legacy " + email + ": " + res.raw);
        } else {
          try {
            const data = JSON.parse(res.raw);
            const hubPass = data.company_pass || "Admin1234!";
            record.setPassword(hubPass);
            $app.save(record);
            console.log("[GRAVY SYNC] Sincronización legacy exitosa para " + email + " (contraseña local alineada con el HUB)");
          } catch (pwErr) {
            console.log("[GRAVY SYNC] Error al establecer contraseña local para " + email + " desde el HUB: " + pwErr);
          }
        }
      } catch (innerErr) {
        console.log("[GRAVY SYNC] Error al sincronizar usuario legacy individual: " + innerErr);
      }
    }
  } catch (err) {
    console.log("[GRAVY SYNC] Error general al sincronizar usuarios existentes: " + err);
  }
});

// 4. Endpoint personalizado para permitir a los administradores actualizar usuarios (incluyendo contraseña) con privilegios de sistema
routerAdd("POST", "/api/gravy/admin/update-user", (e) => {
  let authRecord = null;
  try { authRecord = e.auth; } catch (_) {}
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  
  if (!authRecord) {
    e.json(401, { message: "No autorizado" });
    return;
  }
  
  const requesterRole = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (requesterRole !== "admin" && requesterRole !== "superadmin" && requesterRole !== "administrador") {
    e.json(403, { message: "Permisos insuficientes para realizar esta acción" });
    return;
  }

  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }

  const userId = String(body.id || "").trim();
  if (!userId) {
    e.json(400, { message: "El ID de usuario es requerido" });
    return;
  }

  try {
    const record = $app.findRecordById("users", userId);
    
    // Actualizar campos si se proveen
    if (body.full_name !== undefined) record.set("full_name", String(body.full_name).trim());
    if (body.name !== undefined) record.set("name", String(body.name).trim());
    if (body.role !== undefined) record.set("role", String(body.role).trim());
    if (body.active !== undefined) record.set("active", !!body.active);
    if (body.default_branch_id !== undefined) record.set("default_branch_id", body.default_branch_id || null);
    if (body.allowed_branches !== undefined) record.set("allowed_branches", body.allowed_branches || []);
    if (body.default_warehouse_id !== undefined) record.set("default_warehouse_id", body.default_warehouse_id || null);
    if (body.allowed_warehouses !== undefined) record.set("allowed_warehouses", body.allowed_warehouses || []);
    if (body.topbar_color !== undefined) record.set("topbar_color", String(body.topbar_color).trim());
    if (body.can_edit_docs !== undefined) record.set("can_edit_docs", !!body.can_edit_docs);

    // Si se pasa contraseña, actualizarla usando setPassword
    const password = String(body.password || "").trim();
    if (password) {
      record.setPassword(password);
    }

    $app.save(record);

    // Sincronizar con el HUB si se actualizó el password
    if (password) {
      try {
        const email = record.getString("email");
        const fullName = record.getString("full_name") || record.getString("name") || email.split('@')[0];
        const role = record.getString("role") || "viewer";
        const active = record.getBool("active");
        let companyName = "";
        try { companyName = $app.findFirstRecordByFilter("settings", "key = 'company_name'").get("value") || ""; } catch (_) {}
        let companyNit = "";
        try { companyNit = $app.findFirstRecordByFilter("settings", "key = 'company_nit'").get("value") || ""; } catch (_) {}
        
        const payload = { email, fullName, role, active, password, companyName, companyNit };
        $http.send({
          url: "http://127.0.0.1:8089/api/hub/sync-tenant-user",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (hubErr) {
        console.log("[GRAVY ADMIN SYNC] Error replicando a HUB: " + hubErr);
      }
    }

    e.json(200, { success: true, message: "Usuario actualizado correctamente" });
  } catch (err) {
    e.json(500, { message: "Error al actualizar usuario: " + String(err) });
  }
});

