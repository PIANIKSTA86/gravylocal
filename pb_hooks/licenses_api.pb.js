/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — licenses_api.pb.js
 * Endpoints locales para la gestión de licencias y módulos del Tenant.
 */

routerAdd("GET", "/api/gravy/my-licenses", (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    return e.json(401, { message: "No autenticado en el sistema local" });
  }

  try {
    const records = $app.findRecordsByFilter("licenses", "enabled = true");
    const modules = records.map(r => ({
      module_key: r.getString("module_key"),
      plan: r.getString("plan"),
      expires_at: r.getString("expires_at")
    }));
    return e.json(200, { modules });
  } catch (err) {
    return e.json(500, { message: "Error al cargar licencias locales: " + err.message });
  }
});

routerAdd("POST", "/api/gravy/toggle-license", (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    return e.json(401, { message: "No autenticado en el sistema local" });
  }

  const role = auth.getString("role") || "viewer";
  if (role !== "admin" && role !== "superadmin") {
    return e.json(403, { message: "Solo los administradores pueden modificar licencias locales" });
  }

  const body = e.requestInfo()?.body || {};
  const moduleKey = String(body.module_key || "").trim();
  const enabled = body.enabled !== false;

  if (!moduleKey) {
    return e.json(400, { message: "Falta el parámetro module_key" });
  }

  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    let record = null;
    try {
      // Intentar buscar registro existente
      const records = $app.findRecordsByFilter("licenses", `module_key = "${moduleKey}"`, "", 1, 0);
      if (records && records.length > 0) {
        record = records[0];
      }
    } catch (_) {}

    if (record) {
      record.set("enabled", enabled);
      $app.save(record);
    } else {
      record = new Record(licensesCol, {
        module_key: moduleKey,
        enabled: enabled,
        plan: "perpetua"
      });
      $app.save(record);
    }

    return e.json(200, { ok: true, message: `Módulo "${moduleKey}" ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente.` });
  } catch (err) {
    return e.json(500, { message: "Error al guardar la licencia: " + err.message });
  }
});
