/// <reference path="../../pb_data/types.d.ts" />

/**
 * GRAVY HUB — Configuración y Semilla
 * Se ejecuta al iniciar el servidor HUB (puerto 8089).
 */

onBootstrap((e) => {
  e.next();

  // ─── 1. Colección hub_users (Identidad global) ─────────────────────────
  let hubUsers;
  try {
    hubUsers = $app.findCollectionByNameOrId("hub_users");
  } catch (_) {
    hubUsers = new Collection({
      name: "hub_users",
      type: "auth",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.is_superadmin = true",
      updateRule: "@request.auth.id = id || @request.auth.is_superadmin = true",
      deleteRule: "@request.auth.is_superadmin = true",
      fields: [
        { name: "full_name",     type: "text", required: true },
        { name: "is_superadmin", type: "bool", required: false },
      ],
    });
    $app.save(hubUsers);
    console.log("[GRAVY HUB] Colección 'hub_users' creada.");
  }

  // ─── 2. Colección companies (Directorio) ──────────────────────────────
  let companies;
  try {
    companies = $app.findCollectionByNameOrId("companies");
  } catch (_) {
    companies = new Collection({
      name: "companies",
      type: "base",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.is_superadmin = true",
      updateRule: "@request.auth.is_superadmin = true",
      deleteRule: "@request.auth.is_superadmin = true",
      fields: [
        { name: "name",        type: "text",   required: true },
        { name: "nit",         type: "text",   required: false },
        { name: "url",         type: "url",    required: true },
        { name: "port",        type: "number", required: true },
        { name: "active",      type: "bool",   required: false },
        { name: "color_theme", type: "text",   required: false },
      ],
    });
    $app.save(companies);
    console.log("[GRAVY HUB] Colección 'companies' creada.");
  }

  // ─── 3. Colección user_company_access (Permisos) ──────────────────────
  let uca;
  try {
    uca = $app.findCollectionByNameOrId("user_company_access");
  } catch (_) {
    uca = new Collection({
      name: "user_company_access",
      type: "base",
      listRule: "@request.auth.id != '' && (hub_user_id = @request.auth.id || @request.auth.is_superadmin = true)",
      viewRule: "@request.auth.id != '' && (hub_user_id = @request.auth.id || @request.auth.is_superadmin = true)",
      createRule: "@request.auth.is_superadmin = true",
      updateRule: "@request.auth.is_superadmin = true",
      deleteRule: "@request.auth.is_superadmin = true",
      fields: [
        { name: "hub_user_id",   type: "relation", required: true, collectionId: hubUsers.id, maxSelect: 1 },
        { name: "company_id",    type: "relation", required: true, collectionId: companies.id, maxSelect: 1 },
        { name: "role",          type: "select",   required: true, values: ["admin","contador","auxiliar","auditor","viewer"] },
        { name: "company_email", type: "email",    required: true },
        { name: "company_pass",  type: "text",     required: true }, // Contraseña sincronizada para la BD de la empresa
        { name: "active",        type: "bool",     required: false },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_uca_user_co ON user_company_access (hub_user_id, company_id)"],
    });
    $app.save(uca);
    console.log("[GRAVY HUB] Colección 'user_company_access' creada.");
  }

  // ─── 4. Colección licenses (Módulos por empresa) ──────────────────────
  let licenses;
  try {
    licenses = $app.findCollectionByNameOrId("licenses");
  } catch (_) {
    licenses = new Collection({
      name: "licenses",
      type: "base",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.is_superadmin = true",
      updateRule: "@request.auth.is_superadmin = true",
      deleteRule: "@request.auth.is_superadmin = true",
      fields: [
        { name: "company_id", type: "relation", required: true, collectionId: companies.id, maxSelect: 1 },
        { name: "module_key", type: "select",   required: true, values: ["core","contabilidad","comercial","nomina","copropiedades","full"] },
        { name: "enabled",    type: "bool",     required: true },
        { name: "expires_at", type: "text",     required: false },
        { name: "plan",       type: "select",   required: false, values: ["trial","mensual","anual","perpetua"] },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_lic_co_mod ON licenses (company_id, module_key)"],
    });
    $app.save(licenses);
    console.log("[GRAVY HUB] Colección 'licenses' creada.");
  }

  // ─── SEMILLA INICIAL ──────────────────────────────────────────────────
  
  // 1. Crear usuario SuperAdmin en el Hub si no hay ninguno
  let adminRecord;
  try {
    const records = $app.findRecordsByFilter("hub_users", "is_superadmin = true", "", 1, 0);
    if (records.length === 0) throw new Error("No superadmin");
    adminRecord = records[0];
  } catch (_) {
    adminRecord = new Record(hubUsers);
    adminRecord.set("email", "admin@contaco.com");
    adminRecord.setPassword("Admin1234!");
    adminRecord.set("full_name", "SuperAdministrador");
    adminRecord.set("is_superadmin", true);
    $app.save(adminRecord);
    console.log("[GRAVY HUB] Usuario admin@contaco.com creado.");
  }

  // 2. Crear Empresa Demo si no existe
  let demoCompany;
  try {
    const records = $app.findRecordsByFilter("companies", "port = 8090", "", 1, 0);
    if (records.length === 0) throw new Error("No demo company");
    demoCompany = records[0];
  } catch (_) {
    demoCompany = new Record(companies);
    demoCompany.set("name", "Empresa Demo S.A.S.");
    demoCompany.set("nit", "900.123.456-7");
    demoCompany.set("url", "http://localhost:8090");
    demoCompany.set("port", 8090);
    demoCompany.set("active", true);
    demoCompany.set("color_theme", "#2446B8");
    $app.save(demoCompany);
    console.log("[GRAVY HUB] Empresa Demo creada.");
  }

  // 3. Dar acceso al SuperAdmin a la Empresa Demo
  try {
    $app.findFirstRecordByData("user_company_access", "hub_user_id", adminRecord.id);
  } catch (_) {
    const access = new Record(uca);
    access.set("hub_user_id", adminRecord.id);
    access.set("company_id", demoCompany.id);
    access.set("role", "admin");
    access.set("company_email", "admin@contaco.com");
    access.set("company_pass", "Admin1234!"); // Contraseña real en la base de datos de la empresa
    access.set("active", true);
    $app.save(access);
    console.log("[GRAVY HUB] Acceso concedido al SuperAdmin a Empresa Demo.");
  }

  // 4. Asegurar licencias para la Empresa Demo
  const modules = ["core", "contabilidad", "comercial", "nomina", "copropiedades"];
  for (const mod of modules) {
    try {
      $app.findRecordsByFilter("licenses", `company_id = '${demoCompany.id}' && module_key = '${mod}'`, "", 1, 0);
      // Wait, findRecordsByFilter returns array. Let's check length.
      const recs = $app.findRecordsByFilter("licenses", `company_id = '${demoCompany.id}' && module_key = '${mod}'`, "", 1, 0);
      if (recs.length === 0) throw new Error("not found");
    } catch (_) {
      try {
        const lic = new Record(licenses);
        lic.set("company_id", demoCompany.id);
        lic.set("module_key", mod);
        lic.set("enabled", true);
        lic.set("plan", "perpetua");
        $app.save(lic);
      } catch (err) {
        console.log("[GRAVY HUB] Error creando licencia " + mod + ": " + err);
      }
    }
  }

});
