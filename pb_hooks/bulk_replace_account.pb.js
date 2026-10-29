/// <reference path="../pb_data/types.d.ts" />

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDAD: REEMPLAZO MASIVO DE CUENTA CONTABLE
   ─ Endpoint 1: POST /api/gravy/bulk-replace-account
     Reemplaza TODOS los terceros de una cuenta por otra en un período.
   ─ Endpoint 2: GET  /api/gravy/bulk-replace-account/preview
     Devuelve la lista de terceros con movimientos en la cuenta/período.
   ─ Endpoint 3: POST /api/gravy/bulk-replace-account-by-third-party
     Reemplaza SOLO los terceros seleccionados de una cuenta por otra.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Endpoint 1: Reemplazo masivo (todos los terceros) ─────────────────── */

routerAdd("POST", "/api/gravy/bulk-replace-account", (e) => {
  // 1. Verificar autenticación y rol
  let authRecord = e.auth;
  if (!authRecord) {
    try { authRecord = e.requestInfo().authRecord || e.requestInfo().auth; } catch (_) {}
  }
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin" && role !== "admin") {
    return e.json(403, { message: "No tienes permisos para ejecutar esta acción (requiere ADMIN o SUPERADMIN)" });
  }

  // 2. Parámetros
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}

  const oldCode   = String(body.oldAccountCode || "").trim();
  const newCode   = String(body.newAccountCode || "").trim();
  const startDate = String(body.startDate      || "").trim();
  const endDate   = String(body.endDate        || "").trim();

  if (!oldCode || !newCode) {
    return e.json(400, { message: "El código de la cuenta origen y de la cuenta destino son obligatorios" });
  }
  if (!startDate || !endDate) {
    return e.json(400, { message: "La fecha de inicio y de fin son obligatorias" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return e.json(400, { message: "Las fechas deben tener el formato YYYY-MM-DD" });
  }
  if (startDate > endDate) {
    return e.json(400, { message: "La fecha de inicio no puede ser posterior a la fecha de fin" });
  }

  try {
    // 3. Resolver cuentas
    let oldAccount = null;
    let newAccount = null;
    try { oldAccount = $app.findFirstRecordByFilter("accounts", "code = '" + oldCode + "'"); } catch (_) {}
    try { newAccount = $app.findFirstRecordByFilter("accounts", "code = '" + newCode + "'"); } catch (_) {}

    if (!oldAccount) {
      return e.json(400, { message: "La cuenta de origen con código " + oldCode + " no existe" });
    }
    if (!newAccount) {
      return e.json(400, { message: "La cuenta de destino con código " + newCode + " no existe" });
    }

    const db = $app.nonconcurrentDB();

    // 4. Contar líneas afectadas
    const countSql = "SELECT COUNT(*) as count FROM tx_lines " +
                     "WHERE account_id = '" + oldAccount.id + "' " +
                     "AND tx_id IN (SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "')";
    const countRow = new DynamicModel({ count: 0 });
    db.newQuery(countSql).one(countRow);
    const totalLinesToUpdate = countRow.count || 0;

    if (totalLinesToUpdate === 0) {
      return e.json(200, {
        success: true,
        message: "No se encontraron asientos contables utilizando la cuenta " + oldCode + " en el período indicado.",
        updated: 0
      });
    }

    // 5. Ejecutar UPDATE
    const updateSql = "UPDATE tx_lines SET account_id = '" + newAccount.id + "' " +
                      "WHERE account_id = '" + oldAccount.id + "' " +
                      "AND tx_id IN (SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "')";
    db.newQuery(updateSql).execute();

    // 6. Auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at:  new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action:    "BULK_ACCOUNT_REPLACE",
        entity:    "sistema",
        entity_id: "",
        details:   "Reemplazo masivo de cuentas (TODOS los terceros): " + oldCode + " -> " + newCode +
                   " (" + startDate + " a " + endDate + "). Se actualizaron " + totalLinesToUpdate + " líneas contables.",
        user_id:   authRecord.id,
        username:  authRecord.getString("email") || authRecord.getString("username") || "system"
      });
      $app.save(auditRec);
    } catch (auditErr) {
      console.warn("[Bulk Replace Audit Error]", auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Se reemplazó correctamente la cuenta " + oldCode + " por " + newCode + " en " + totalLinesToUpdate + " líneas contables.",
      updated: totalLinesToUpdate
    });

  } catch (err) {
    console.error("[Bulk Replace Exception]", err);
    return e.json(500, { success: false, message: "Error al realizar el reemplazo masivo: " + err.message });
  }
});

/* ── Endpoint 2: Preview — terceros con movimientos en la cuenta/período ─ */

routerAdd("GET", "/api/gravy/bulk-replace-account/preview", (e) => {
  // 1. Verificar autenticación y rol
  let authRecord = e.auth;
  if (!authRecord) {
    try { authRecord = e.requestInfo().authRecord || e.requestInfo().auth; } catch (_) {}
  }
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin" && role !== "admin") {
    return e.json(403, { message: "No tienes permisos para ejecutar esta acción (requiere ADMIN o SUPERADMIN)" });
  }

  // 2. Parámetros desde query string
  let queryParams = {};
  try { queryParams = e.requestInfo().query || {}; } catch (_) {}

  const oldCode   = String(queryParams.oldCode   || queryParams.old_code   || "").trim();
  const startDate = String(queryParams.startDate || queryParams.start_date || "").trim();
  const endDate   = String(queryParams.endDate   || queryParams.end_date   || "").trim();

  if (!oldCode) {
    return e.json(400, { message: "El parámetro oldCode es obligatorio" });
  }
  if (!startDate || !endDate) {
    return e.json(400, { message: "La fecha de inicio y de fin son obligatorias" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return e.json(400, { message: "Las fechas deben tener el formato YYYY-MM-DD" });
  }
  if (startDate > endDate) {
    return e.json(400, { message: "La fecha de inicio no puede ser posterior a la fecha de fin" });
  }

  try {
    // 3. Resolver cuenta origen
    let oldAccount = null;
    try { oldAccount = $app.findFirstRecordByFilter("accounts", "code = '" + oldCode + "'"); } catch (_) {}
    if (!oldAccount) {
      return e.json(400, { message: "La cuenta de origen con código " + oldCode + " no existe" });
    }

    const db = $app.nonconcurrentDB();

    // 4. Obtener terceros distintos con sus conteos de líneas en el período
    const previewSql =
      "SELECT " +
      "  tl.third_party_id AS id, " +
      "  COALESCE(tp.doc_number, '') AS doc_number, " +
      "  COALESCE(tp.name, '(Sin nombre)') AS name, " +
      "  COUNT(tl.id) AS line_count " +
      "FROM tx_lines tl " +
      "INNER JOIN transactions tx ON tl.tx_id = tx.id " +
      "LEFT  JOIN third_parties tp ON tl.third_party_id = tp.id " +
      "WHERE tl.account_id = '" + oldAccount.id + "' " +
      "  AND tx.date >= '" + startDate + "' " +
      "  AND tx.date <= '" + endDate + "' " +
      "  AND tl.third_party_id IS NOT NULL " +
      "  AND tl.third_party_id != '' " +
      "GROUP BY tl.third_party_id, tp.doc_number, tp.name " +
      "ORDER BY tp.name ASC";

    const rows = arrayOf(new DynamicModel({
      id:         "",
      doc_number: "",
      name:       "",
      line_count: 0
    }));

    db.newQuery(previewSql).all(rows);

    const terceros = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      terceros.push({
        id:         r.id,
        doc_number: r.doc_number,
        name:       r.name,
        line_count: r.line_count
      });
    }

    return e.json(200, {
      success:  true,
      terceros: terceros,
      total:    terceros.length
    });

  } catch (err) {
    console.error("[Bulk Replace Preview Exception]", err);
    return e.json(500, { success: false, message: "Error al obtener previsualización: " + err.message });
  }
});

/* ── Endpoint 3: Reemplazo filtrado por tercero(s) seleccionados ──────── */

routerAdd("POST", "/api/gravy/bulk-replace-account-by-third-party", (e) => {
  // 1. Verificar autenticación y rol
  let authRecord = e.auth;
  if (!authRecord) {
    try { authRecord = e.requestInfo().authRecord || e.requestInfo().auth; } catch (_) {}
  }
  if (!authRecord) {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin" && role !== "admin") {
    return e.json(403, { message: "No tienes permisos para ejecutar esta acción (requiere ADMIN o SUPERADMIN)" });
  }

  // 2. Parámetros
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}

  const oldCode       = String(body.oldAccountCode || "").trim();
  const newCode       = String(body.newAccountCode || "").trim();
  const startDate     = String(body.startDate      || "").trim();
  const endDate       = String(body.endDate        || "").trim();
  const thirdPartyIds = Array.isArray(body.thirdPartyIds) ? body.thirdPartyIds : [];

  if (!oldCode || !newCode) {
    return e.json(400, { message: "El código de la cuenta origen y de la cuenta destino son obligatorios" });
  }
  if (!startDate || !endDate) {
    return e.json(400, { message: "La fecha de inicio y de fin son obligatorias" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return e.json(400, { message: "Las fechas deben tener el formato YYYY-MM-DD" });
  }
  if (startDate > endDate) {
    return e.json(400, { message: "La fecha de inicio no puede ser posterior a la fecha de fin" });
  }
  if (!thirdPartyIds.length) {
    return e.json(400, { message: "Debe seleccionar al menos un tercero para aplicar el filtro" });
  }

  // 3. Sanitizar IDs
  const safeIds = thirdPartyIds
    .map(id => String(id || "").trim())
    .filter(id => /^[a-z0-9]+$/i.test(id) && id.length > 0);

  if (!safeIds.length) {
    return e.json(400, { message: "Los IDs de terceros proporcionados no son válidos" });
  }

  try {
    // 4. Resolver cuentas
    let oldAccount = null;
    let newAccount = null;
    try { oldAccount = $app.findFirstRecordByFilter("accounts", "code = '" + oldCode + "'"); } catch (_) {}
    try { newAccount = $app.findFirstRecordByFilter("accounts", "code = '" + newCode + "'"); } catch (_) {}

    if (!oldAccount) {
      return e.json(400, { message: "La cuenta de origen con código " + oldCode + " no existe" });
    }
    if (!newAccount) {
      return e.json(400, { message: "La cuenta de destino con código " + newCode + " no existe" });
    }

    const db     = $app.nonconcurrentDB();
    const idList = safeIds.map(id => "'" + id + "'").join(", ");

    // 5. Contar líneas afectadas
    const countSql =
      "SELECT COUNT(*) as count FROM tx_lines " +
      "WHERE account_id = '" + oldAccount.id + "' " +
      "  AND third_party_id IN (" + idList + ") " +
      "  AND tx_id IN (" +
      "    SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "'" +
      "  )";
    const countRow = new DynamicModel({ count: 0 });
    db.newQuery(countSql).one(countRow);
    const totalLinesToUpdate = countRow.count || 0;

    if (totalLinesToUpdate === 0) {
      return e.json(200, {
        success: true,
        message: "No se encontraron líneas para los terceros seleccionados en la cuenta " + oldCode + " durante el período indicado.",
        updated: 0
      });
    }

    // 6. Ejecutar UPDATE
    const updateSql =
      "UPDATE tx_lines SET account_id = '" + newAccount.id + "' " +
      "WHERE account_id = '" + oldAccount.id + "' " +
      "  AND third_party_id IN (" + idList + ") " +
      "  AND tx_id IN (" +
      "    SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "'" +
      "  )";
    db.newQuery(updateSql).execute();

    // 7. Auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at:  new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action:    "BULK_ACCOUNT_REPLACE",
        entity:    "sistema",
        entity_id: "",
        details:   "Reemplazo masivo por tercero(s): " + oldCode + " -> " + newCode +
                   " (" + startDate + " a " + endDate + "). " +
                   "Terceros afectados (" + safeIds.length + "): [" + safeIds.join(", ") + "]. " +
                   "Líneas actualizadas: " + totalLinesToUpdate + ".",
        user_id:   authRecord.id,
        username:  authRecord.getString("email") || authRecord.getString("username") || "system"
      });
      $app.save(auditRec);
    } catch (auditErr) {
      console.warn("[Bulk Replace By TP Audit Error]", auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Se reasignaron " + totalLinesToUpdate + " líneas de " + safeIds.length +
               " tercero(s) de la cuenta " + oldCode + " a la cuenta " + newCode + ".",
      updated: totalLinesToUpdate
    });

  } catch (err) {
    console.error("[Bulk Replace By Third Party Exception]", err);
    return e.json(500, { success: false, message: "Error al realizar el reemplazo por tercero: " + err.message });
  }
});