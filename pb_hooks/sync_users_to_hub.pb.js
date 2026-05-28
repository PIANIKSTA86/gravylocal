/// <reference path="../pb_data/types.d.ts" />

// 1. Replicar al crear usuario
onRecordCreateRequest((e) => {
  e.next();
  const record = e.record;
  const password = e.requestInfo()?.body?.password || "";
  
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
  e.next();
  const record = e.record;
  const password = e.requestInfo()?.body?.password || "";
  
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
        
        // Forzar contraseña local a Admin1234! para coincidir con la credencial del HUB
        try {
          record.setPassword("Admin1234!");
          $app.save(record);
        } catch (pwErr) {
          console.log("[GRAVY SYNC] Error al establecer contraseña local para " + email + ": " + pwErr);
        }
        
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
          console.log("[GRAVY SYNC] Sincronización legacy exitosa para " + email);
        }
      } catch (innerErr) {
        console.log("[GRAVY SYNC] Error al sincronizar usuario legacy individual: " + innerErr);
      }
    }
  } catch (err) {
    console.log("[GRAVY SYNC] Error general al sincronizar usuarios existentes: " + err);
  }
});
