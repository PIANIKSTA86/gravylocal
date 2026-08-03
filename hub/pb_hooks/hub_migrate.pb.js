/// <reference path="../../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  try {
    const isMigrated = $app.findRecordsByFilter("hub_users", "email = 'sm2.solutions.co@gmail.com'", "", 1, 0);
    if (isMigrated && isMigrated.length > 0) {
      return; // Ya migrado
    }
  } catch (_) {}

  console.log("[GRAVY HUB] Ejecutando migración de usuarios Legacy a HUB...");

  try {
    // Buscar la empresa Demo
    const companies = $app.findRecordsByFilter("companies", "port = 8090", "", 1, 0);
    if (!companies || companies.length === 0) return;
    const demoCompany = companies[0];

    // Conectar directamente a la base de datos de la Empresa Demo usando DBX
    const dbPath = "../../pb_data/data.db"; // Relativo desde el root de hub si ejecutamos el HUB allí.
    // En PocketBase no podemos abrir otras DB fácilmente con $app.db() si no están registradas.
    // Pero podemos usar un workaround si falla, usamos Node.js.
  } catch (err) {
    console.log("Error en hook:", err);
  }
});
