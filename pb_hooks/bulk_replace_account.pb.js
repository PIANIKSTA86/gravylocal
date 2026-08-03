/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/gravy/bulk-replace-account", (e) => {
  // 1. Verificar autenticación
  const authRecord = e.auth;
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  // 2. Verificar rol (admin o superadmin)
  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin" && role !== "admin") {
    return e.json(403, { message: "No tienes permisos para ejecutar esta acción (requiere ADMIN o SUPERADMIN)" });
  }

  // 3. Obtener parámetros del cuerpo de la petición
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}

  const oldCode = String(body.oldAccountCode || "").trim();
  const newCode = String(body.newAccountCode || "").trim();
  const startDate = String(body.startDate || "").trim();
  const endDate = String(body.endDate || "").trim();

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
    // 4. Buscar las cuentas correspondientes en la colección accounts
    let oldAccount = null;
    let newAccount = null;

    try {
      oldAccount = $app.findFirstRecordByFilter("accounts", "code = '" + oldCode + "'");
    } catch (_) {}
    try {
      newAccount = $app.findFirstRecordByFilter("accounts", "code = '" + newCode + "'");
    } catch (_) {}

    if (!oldAccount) {
      return e.json(400, { message: "La cuenta de origen con código " + oldCode + " no existe" });
    }
    if (!newAccount) {
      return e.json(400, { message: "La cuenta de destino con código " + newCode + " no existe" });
    }

    const db = $app.nonconcurrentDB();

    // 5. Contar cuántas líneas se verán afectadas
    const countSql = "SELECT COUNT(*) as count FROM tx_lines WHERE account_id = '" + oldAccount.id + "' " +
                     "AND tx_id IN (SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "')";
    
    const countQuery = db.newQuery(countSql);
    const countRow = new DynamicModel({ count: 0 });
    countQuery.one(countRow);
    const totalLinesToUpdate = countRow.count || 0;

    if (totalLinesToUpdate === 0) {
      return e.json(200, {
        success: true,
        message: "No se encontraron asientos contables utilizando la cuenta " + oldCode + " en el período indicado.",
        updated: 0
      });
    }

    // 6. Ejecutar la actualización en SQLite
    const updateSql = "UPDATE tx_lines SET account_id = '" + newAccount.id + "' " +
                      "WHERE account_id = '" + oldAccount.id + "' " +
                      "AND tx_id IN (SELECT id FROM transactions WHERE date >= '" + startDate + "' AND date <= '" + endDate + "')";
    db.newQuery(updateSql).execute();

    // 7. Registrar en el log de auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action:   "BULK_ACCOUNT_REPLACE",
        entity:   "sistema",
        entity_id: "",
        details:  "Reemplazo masivo de cuentas: " + oldCode + " -> " + newCode + " (" + startDate + " a " + endDate + "). Se actualizaron " + totalLinesToUpdate + " líneas contables.",
        user_id:  authRecord.id,
        username: authRecord.getString("email") || authRecord.getString("username") || "system"
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
    return e.json(500, {
      success: false,
      message: "Error al realizar el reemplazo masivo: " + err.message
    });
  }
});
