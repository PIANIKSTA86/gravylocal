onBootstrap((e) => {
  e.next();
  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    const modField = licensesCol.fields.getByName("module_key");
    if (modField) {
      const allNeeded = [
        "core", "contabilidad", "comercial", "crm", "nomina",
        "copropiedades", "inmobiliarias", "importaciones", "logistica", "inventarios",
        "tesoreria", "tienda-virtual", "spa", "spa-belleza",
        "conciliacion", "niif", "activos_fijos", "full"
      ];
      const currentVals = modField.values || [];
      const valsArray = [];
      for (let j = 0; j < currentVals.length; j++) {
        valsArray.push(currentVals[j]);
      }
      let changed = false;
      allNeeded.forEach(v => {
        if (valsArray.indexOf(v) === -1) {
          valsArray.push(v);
          changed = true;
        }
      });
      if (changed) {
        modField.values = valsArray;
        $app.save(licensesCol);
        console.log("[GRAVY Tenant] Esquema de licenses actualizado con todos los módulos.");
      }
    }
  } catch (err) {
    console.log("[GRAVY Tenant] Aviso asegurando esquema de licencias: " + err);
  }
});

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

    // Asegurar dinámicamente que el module_key exista en los valores permitidos
    const modField = licensesCol.fields.getByName("module_key");
    if (modField && modField.values) {
      let found = false;
      const vals = [];
      for (let i = 0; i < modField.values.length; i++) {
        vals.push(modField.values[i]);
        if (modField.values[i] === moduleKey) found = true;
      }
      if (!found) {
        vals.push(moduleKey);
        modField.values = vals;
        $app.save(licensesCol);
      }
    }

    let record = null;
    try {
      // Intentar buscar registro existente
      const records = $app.findRecordsByFilter("licenses", `module_key = "${moduleKey}"`, "", 1, 0);
      if (records && records.length > 0) {
        record = records[0];
      }
    } catch (_) {}

    try {
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
    } catch (saveErr) {
      try {
        const existing = $app.db().newQuery("SELECT id FROM licenses WHERE module_key = {:mod}")
          .bind({ mod: moduleKey })
          .one();

        if (existing && existing.id) {
          $app.db().newQuery("UPDATE licenses SET enabled = {:enabled}, updated = datetime('now') WHERE id = {:id}")
            .bind({ enabled: enabled ? 1 : 0, id: existing.id })
            .execute();
        } else {
          const newId = $security.randomString(15);
          $app.db().newQuery("INSERT INTO licenses (id, module_key, enabled, plan, created, updated) VALUES ({:id}, {:mod}, {:enabled}, 'perpetua', datetime('now'), datetime('now'))")
            .bind({ id: newId, mod: moduleKey, enabled: enabled ? 1 : 0 })
            .execute();
        }
      } catch (dbErr) {
        throw new Error("Error guardando licencia local: " + dbErr.message);
      }
    }

    return e.json(200, { ok: true, message: `Módulo "${moduleKey}" ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente.` });
  } catch (err) {
    return e.json(500, { message: "Error al guardar la licencia: " + err.message });
  }
});

