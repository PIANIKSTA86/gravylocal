/// <reference path="../pb_data/types.d.ts" />

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDAD: REASIGNACIÓN MASIVA DE TERCEROS EN MOVIMIENTOS CONTABLES
   ─ Endpoint 1: GET  /api/gravy/bulk-replace-third-party/preview
     Analiza transacciones y líneas contables del tercero origen en el período,
     desglosando por cuenta contable y alertando sobre documentos electrónicos.
   ─ Endpoint 2: POST /api/gravy/bulk-replace-third-party
     Reasigna tx_lines y transactions del tercero origen hacia el tercero destino
     con soporte para filtro selectivo de cuentas y registro de auditoría.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Endpoint 1: Previsualización y análisis de movimientos ─────────────── */

routerAdd("GET", "/api/gravy/bulk-replace-third-party/preview", (e) => {
  // 1. Validar autenticación y rol
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
  let queryParams = {};
  try { queryParams = e.requestInfo().query || {}; } catch (_) {}

  const oldTpId   = String(queryParams.oldThirdPartyId || queryParams.old_third_party_id || "").trim();
  const startDate = String(queryParams.startDate       || queryParams.start_date       || "").trim();
  const endDate   = String(queryParams.endDate         || queryParams.end_date         || "").trim();

  if (!oldTpId) {
    return e.json(400, { message: "El tercero origen es obligatorio" });
  }
  if (!startDate || !endDate) {
    return e.json(400, { message: "La fecha inicial y final son obligatorias" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return e.json(400, { message: "Formato de fechas inválido (debe ser YYYY-MM-DD)" });
  }
  if (startDate > endDate) {
    return e.json(400, { message: "La fecha inicial no puede ser posterior a la fecha final" });
  }

  try {
    // 3. Validar existencia del tercero origen
    let oldTp = null;
    try { oldTp = $app.findRecordById("third_parties", oldTpId); } catch (_) {}
    if (!oldTp) {
      return e.json(404, { message: "El tercero origen no fue encontrado en la base de datos" });
    }

    const db = $app.nonconcurrentDB();

    // 4. Analizar líneas contables agrupadas por cuenta
    const accountsSql =
      "SELECT " +
      "  a.id AS account_id, " +
      "  a.code AS account_code, " +
      "  a.name AS account_name, " +
      "  COUNT(tl.id) AS line_count, " +
      "  COALESCE(SUM(tl.debit), 0) AS total_debit, " +
      "  COALESCE(SUM(tl.credit), 0) AS total_credit " +
      "FROM tx_lines tl " +
      "INNER JOIN transactions tx ON tl.tx_id = tx.id " +
      "INNER JOIN accounts a ON tl.account_id = a.id " +
      "WHERE tl.third_party_id = '" + oldTpId + "' " +
      "  AND tx.date >= '" + startDate + "' " +
      "  AND tx.date <= '" + endDate + "' " +
      "GROUP BY a.id, a.code, a.name " +
      "ORDER BY a.code ASC";

    const accRows = arrayOf(new DynamicModel({
      account_id: "",
      account_code: "",
      account_name: "",
      line_count: 0,
      total_debit: -0,
      total_credit: -0
    }));

    db.newQuery(accountsSql).all(accRows);

    let totalLines = 0;
    let sumDebit = 0;
    let sumCredit = 0;
    const accounts = [];

    for (let i = 0; i < accRows.length; i++) {
      const r = accRows[i];
      totalLines += Number(r.line_count || 0);
      sumDebit   += Number(r.total_debit || 0);
      sumCredit  += Number(r.total_credit || 0);
      accounts.push({
        id: r.account_id,
        code: r.account_code,
        name: r.account_name,
        line_count: Number(r.line_count || 0),
        total_debit: Number(r.total_debit || 0),
        total_credit: Number(r.total_credit || 0)
      });
    }

    // 5. Contar transacciones de encabezado vinculadas a este tercero
    const txCountSql =
      "SELECT COUNT(*) as count FROM transactions " +
      "WHERE third_party_id = '" + oldTpId + "' " +
      "  AND date >= '" + startDate + "' " +
      "  AND date <= '" + endDate + "'";
    const txCountRow = new DynamicModel({ count: 0 });
    db.newQuery(txCountSql).one(txCountRow);
    const headerTxCount = Number(txCountRow.count || 0);

    // 6. Alertar si existen comprobantes electrónicos DIAN vinculados en el rango
    let dianDocCount = 0;
    try {
      const dianCheckSql =
        "SELECT COUNT(*) as count FROM electronic_documents " +
        "WHERE third_party_id = '" + oldTpId + "' " +
        "  AND issue_date >= '" + startDate + "' " +
        "  AND issue_date <= '" + endDate + "'";
      const dianRow = new DynamicModel({ count: 0 });
      db.newQuery(dianCheckSql).one(dianRow);
      dianDocCount = Number(dianRow.count || 0);
    } catch (_) {}

    return e.json(200, {
      success: true,
      tercero: {
        id: oldTp.id,
        doc_number: oldTp.getString("doc_number") || "",
        name: oldTp.getString("name") || ""
      },
      summary: {
        total_accounts: accounts.length,
        total_lines: totalLines,
        header_transactions: headerTxCount,
        total_debit: sumDebit,
        total_credit: sumCredit,
        electronic_dian_docs: dianDocCount
      },
      accounts: accounts
    });

  } catch (err) {
    console.error("[Bulk Replace Third Party Preview Error]", err);
    return e.json(500, { success: false, message: "Error al previsualizar movimientos: " + err.message });
  }
});

/* ── Endpoint 2: Reasignación masiva y segura de tercero ───────────────── */

routerAdd("POST", "/api/gravy/bulk-replace-third-party", (e) => {
  // 1. Validar autenticación y rol
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

  const oldTpId     = String(body.oldThirdPartyId || "").trim();
  const newTpId     = String(body.newThirdPartyId || "").trim();
  const startDate   = String(body.startDate       || "").trim();
  const endDate     = String(body.endDate         || "").trim();
  const accountIds  = Array.isArray(body.accountIds) ? body.accountIds : [];
  const updateHeaders = body.updateHeaders !== false; // true por defecto

  if (!oldTpId || !newTpId) {
    return e.json(400, { message: "El tercero de origen y de destino son obligatorios" });
  }
  if (oldTpId === newTpId) {
    return e.json(400, { message: "El tercero de destino no puede ser el mismo tercero de origen" });
  }
  if (!startDate || !endDate) {
    return e.json(400, { message: "El rango de fechas es obligatorio" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return e.json(400, { message: "Formato de fechas inválido (debe ser YYYY-MM-DD)" });
  }
  if (startDate > endDate) {
    return e.json(400, { message: "La fecha inicial no puede ser posterior a la fecha final" });
  }

  // Sanitizar IDs de cuentas si se proporcionaron
  const safeAccountIds = accountIds
    .map(id => String(id || "").trim())
    .filter(id => /^[a-z0-9]+$/i.test(id) && id.length > 0);

  try {
    // 3. Validar ambos terceros
    let oldTp = null;
    let newTp = null;
    try { oldTp = $app.findRecordById("third_parties", oldTpId); } catch (_) {}
    try { newTp = $app.findRecordById("third_parties", newTpId); } catch (_) {}

    if (!oldTp) {
      return e.json(404, { message: "El tercero de origen no existe" });
    }
    if (!newTp) {
      return e.json(404, { message: "El tercero de destino no existe" });
    }

    const oldName = oldTp.getString("name") || oldTp.getString("doc_number") || oldTp.id;
    const newName = newTp.getString("name") || newTp.getString("doc_number") || newTp.id;
    const oldDoc  = oldTp.getString("doc_number") || "";
    const newDoc  = newTp.getString("doc_number") || "";

    const db = $app.nonconcurrentDB();

    // 4. Cláusula de cuentas para tx_lines
    let accountFilterSql = "";
    if (safeAccountIds.length > 0) {
      accountFilterSql = " AND tl.account_id IN (" + safeAccountIds.map(id => "'" + id + "'").join(", ") + ") ";
    }

    // 5. Contar líneas contables a afectar
    const countLinesSql =
      "SELECT COUNT(*) as count FROM tx_lines tl " +
      "WHERE tl.third_party_id = '" + oldTpId + "' " +
      accountFilterSql +
      "  AND tl.tx_id IN (" +
      "    SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "'" +
      "  )";
    const countLinesRow = new DynamicModel({ count: 0 });
    db.newQuery(countLinesSql).one(countLinesRow);
    const linesToUpdate = Number(countLinesRow.count || 0);

    // 6. Contar encabezados a afectar (si está habilitado)
    let headersToUpdate = 0;
    if (updateHeaders) {
      const countHeaderSql =
        "SELECT COUNT(*) as count FROM transactions " +
        "WHERE third_party_id = '" + oldTpId + "' " +
        "  AND date >= '" + startDate + "' " +
        "  AND date <= '" + endDate + "'";
      const countHeaderRow = new DynamicModel({ count: 0 });
      db.newQuery(countHeaderSql).one(countHeaderRow);
      headersToUpdate = Number(countHeaderRow.count || 0);
    }

    if (linesToUpdate === 0 && headersToUpdate === 0) {
      return e.json(200, {
        success: true,
        message: "No se encontraron movimientos ni transacciones para el tercero en el período y cuentas indicadas.",
        updated_lines: 0,
        updated_headers: 0
      });
    }

    // 7. Ejecutar actualización en tx_lines
    if (linesToUpdate > 0) {
      let updateLinesSql = "";
      if (safeAccountIds.length > 0) {
        updateLinesSql =
          "UPDATE tx_lines SET third_party_id = '" + newTpId + "' " +
          "WHERE third_party_id = '" + oldTpId + "' " +
          "  AND account_id IN (" + safeAccountIds.map(id => "'" + id + "'").join(", ") + ") " +
          "  AND tx_id IN (" +
          "    SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "'" +
          "  )";
      } else {
        updateLinesSql =
          "UPDATE tx_lines SET third_party_id = '" + newTpId + "' " +
          "WHERE third_party_id = '" + oldTpId + "' " +
          "  AND tx_id IN (" +
          "    SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "'" +
          "  )";
      }
      db.newQuery(updateLinesSql).execute();
    }

    // 8. Ejecutar actualización en transactions (encabezados) si aplica
    if (updateHeaders && headersToUpdate > 0) {
      const updateHeaderSql =
        "UPDATE transactions SET third_party_id = '" + newTpId + "' " +
        "WHERE third_party_id = '" + oldTpId + "' " +
        "  AND date >= '" + startDate + "' " +
        "  AND date <= '" + endDate + "'";
      db.newQuery(updateHeaderSql).execute();
    }

    // 9. Registro de auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at:  new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action:    "BULK_THIRD_PARTY_REPLACE",
        entity:    "terceros",
        entity_id: newTpId,
        details:   "Reasignación masiva de tercero: " +
                   "[" + oldDoc + "] " + oldName + " -> [" + newDoc + "] " + newName + ". " +
                   "Período: " + startDate + " a " + endDate + ". " +
                   "Líneas contables actualizadas: " + linesToUpdate + ", " +
                   "Comprobantes (encabezados) actualizados: " + headersToUpdate + "." +
                   (safeAccountIds.length > 0 ? " Filtrado a " + safeAccountIds.length + " cuentas específicas." : " Aplicado a todas las cuentas."),
        user_id:   authRecord.id,
        username:  authRecord.getString("email") || authRecord.getString("username") || "system"
      });
      $app.save(auditRec);
    } catch (auditErr) {
      console.warn("[Bulk Replace Third Party Audit Error]", auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Se reasignaron exitosamente " + linesToUpdate + " líneas contables y " +
               headersToUpdate + " comprobantes hacia [" + newDoc + "] " + newName + ".",
      updated_lines: linesToUpdate,
      updated_headers: headersToUpdate
    });

  } catch (err) {
    console.error("[Bulk Replace Third Party Execution Error]", err);
    return e.json(500, { success: false, message: "Error al ejecutar la reasignación: " + err.message });
  }
});

