/// <reference path="../../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  try {
    const hubUsers = $app.findCollectionByNameOrId("hub_users");
    const uca = $app.findCollectionByNameOrId("user_company_access");
    const companies = $app.findCollectionByNameOrId("companies");

    const demoCompany = $app.findRecordsByFilter("companies", "port = 8090", "", 1, 0)[0];

    // Buscar o crear usuario
    let user;
    try {
      user = $app.findRecordsByFilter("hub_users", "email = 'sm2.solutions.co@gmail.com'", "", 1, 0)[0];
    } catch (_) {
      user = new Record(hubUsers);
      user.set("email", "sm2.solutions.co@gmail.com");
      user.setPassword("Admin1234!");
      user.set("full_name", "Usuario Legacy");
      user.set("is_superadmin", false);
      $app.save(user);
      console.log("[GRAVY HUB] Usuario sm2.solutions.co@gmail.com migrado al HUB.");
    }

    // Dar acceso a la Empresa Demo
    try {
      $app.findFirstRecordByData("user_company_access", "hub_user_id", user.id);
    } catch (_) {
      const access = new Record(uca);
      access.set("hub_user_id", user.id);
      access.set("company_id", demoCompany.id);
      access.set("role", "admin"); // O el rol que tuviera
      access.set("company_email", "sm2.solutions.co@gmail.com");
      access.set("company_pass", "Admin1234!"); // Forzamos contraseña para que sincronice
      access.set("active", true);
      $app.save(access);
      console.log("[GRAVY HUB] Acceso concedido a sm2.solutions.co@gmail.com.");
    }
  } catch (err) {
    console.log("Error en script de migración:", err);
  }
});
