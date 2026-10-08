/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — renumber_transactions.pb.js
 * Endpoint para renumerar masivamente únicamente el campo `number` en la tabla `transactions`
 * para un tipo de transacción específico dentro de un período de fechas y/o rango numérico opcional.
 */

routerAdd("POST", "/api/gravy/renumber-transactions", (e) => {
  // 1. Verificar autenticación
  let authRecord = e.auth;
  if (!authRecord && typeof $apis !== "undefined") {
    try {
      authRecord = $apis.requestInfo(e).authRecord;
    } catch (_) {}
  }

  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  // 2. Verificar rol (superadmin, admin, administrador, contador)
  let role = "";
  try {
    const colName = authRecord.collection() ? authRecord.collection().name : "";
    if (colName === "_superusers" || colName === "_admins") {
      role = "superadmin";
    } else {
      role = String(authRecord.getString("role") || "").toLowerCase().trim();
    }
  } catch (_) {
    role = "superadmin";
  }

  if (role !== "superadmin" && role !== "admin" && role !== "administrador" && role !== "contador") {
    return e.json(403, { message: "No tienes permisos para realizar la renumeración de documentos (requiere SUPERADMIN, ADMIN o CONTADOR)" });
  }

  // 3. Obtener parámetros del cuerpo
  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      if (typeof $apis !== "undefined") {
        body = $apis.requestInfo(e).body || {};
      }
    } catch (_) {}
  }

  const txTypeId = String(body.txTypeId || "").trim();
  const startDate = String(body.startDate || "").trim();
  const endDate = String(body.endDate || "").trim();
  const fromNum = body.fromNum !== undefined && body.fromNum !== null && String(body.fromNum).trim() !== "" ? Number(body.fromNum) : null;
  const toNum = body.toNum !== undefined && body.toNum !== null && String(body.toNum).trim() !== "" ? Number(body.toNum) : null;
  const newStartConsecutive = Number(body.newStartConsecutive);
  const padDigits = Number(body.padDigits) || 8;

  if (!txTypeId) {
    return e.json(400, { message: "El tipo de transacción (txTypeId) es obligatorio" });
  }

  if (isNaN(newStartConsecutive) || newStartConsecutive < 1) {
    return e.json(400, { message: "El nuevo consecutivo inicial debe ser un número entero mayor o igual a 1" });
  }

  if (startDate && endDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return e.json(400, { message: "Las fechas deben tener el formato YYYY-MM-DD" });
    }
    if (startDate > endDate) {
      return e.json(400, { message: "La fecha inicial no puede ser posterior a la fecha final" });
    }
  }

  try {
    // 4. Buscar la definición del tipo de transacción
    let txType = null;
    try {
      txType = $app.findRecordById("transaction_types", txTypeId);
    } catch (_) {
      try {
        txType = $app.findFirstRecordByFilter("transaction_types", "code = '" + txTypeId + "'");
      } catch (_) {}
    }

    if (!txType) {
      return e.json(404, { message: "El tipo de transacción especificado no existe" });
    }

    if ((txType.getString("numbering_mode") || "continuous") === "period") {
      return e.json(400, { message: "La renumeración manual no aplica a series con numeración mensual (period); ese modo no genera huecos en el consecutivo." });
    }

    const typePrefix = String(txType.getString("prefix") || txType.getString("code") || "").trim();
    const targetTxTypeId = txType.id;

    // 5. Consultar transacciones de este tipo
    let filterStr = "tx_type_id = '" + targetTxTypeId + "'";
    if (startDate && endDate) {
      filterStr += " && date >= '" + startDate + "' && date <= '" + endDate + "'";
    }

    let records = [];
    try {
      records = $app.findRecordsByFilter("transactions", filterStr, "date ASC", 150000);
    } catch (findErr) {
      console.warn("[Renumber Hook Find Warning]", findErr.message);
    }

    if (!records || records.length === 0) {
      return e.json(200, {
        success: true,
        message: "No se encontraron documentos de tipo '" + (txType.getString("name") || typePrefix) + "' en el rango especificado.",
        renumbered: 0
      });
    }

    // 6. Filtrar por rango numérico opcional (en memoria)
    let filteredRecords = records;
    if (fromNum !== null || toNum !== null) {
      filteredRecords = records.filter(r => {
        const rawNum = String(r.getString("number") || r.get("number") || "");
        const matches = rawNum.match(/\d+/g);
        if (!matches || matches.length === 0) return true;
        const numVal = parseInt(matches[matches.length - 1], 10);
        if (isNaN(numVal)) return true;

        if (fromNum !== null && !isNaN(fromNum) && numVal < fromNum) return false;
        if (toNum !== null && !isNaN(toNum) && numVal > toNum) return false;
        return true;
      });
    }

    if (filteredRecords.length === 0) {
      return e.json(200, {
        success: true,
        message: "No se encontraron documentos en el rango numérico especificado.",
        renumbered: 0
      });
    }

    // 7. Renumerar únicamente el campo `number` en la tabla `transactions`
    const db = $app.nonconcurrentDB();
    let renumberedCount = 0;
    let firstNewNumber = "";
    let lastNewNumber = "";
    let maxConsecutiveAssigned = newStartConsecutive;

    for (let i = 0; i < filteredRecords.length; i++) {
      const rec = filteredRecords[i];
      const currentConsec = newStartConsecutive + i;
      if (currentConsec > maxConsecutiveAssigned) {
        maxConsecutiveAssigned = currentConsec;
      }

      let newNumberStr = "";
      if (typePrefix) {
        newNumberStr = typePrefix + "-" + String(currentConsec).padStart(padDigits, "0");
      } else {
        newNumberStr = String(currentConsec);
      }

      if (i === 0) firstNewNumber = newNumberStr;
      lastNewNumber = newNumberStr;

      // Ejecutar la actualización directamente en SQLite sobre la tabla transactions
      const updateSql = "UPDATE transactions SET number = '" + newNumberStr + "' WHERE id = '" + rec.id + "'";
      db.newQuery(updateSql).execute();
      renumberedCount++;
    }

    // 8. Actualizar el consecutivo en la tabla transaction_types si corresponde
    try {
      const currentTypeConsec = Number(txType.getInt("consecutive") || txType.get("consecutive") || 0);
      if (maxConsecutiveAssigned > currentTypeConsec) {
        txType.set("consecutive", maxConsecutiveAssigned);
        $app.save(txType);
      }
    } catch (consecErr) {
      console.warn("[Renumber Hook Consecutive Update Warning]", consecErr.message);
    }

    // 9. Registrar en el log de auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      if (auditCol) {
        const auditRec = new Record(auditCol, {
          event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
          action:   "RENUMBER_TRANSACTIONS",
          entity:   "sistema",
          entity_id: targetTxTypeId,
          details:  "Renumeración de " + renumberedCount + " documentos (" + (txType.getString("name") || typePrefix) + "). Rango asignado: " + firstNewNumber + " a " + lastNewNumber + ".",
          user_id:  authRecord.id,
          username: authRecord.getString("email") || authRecord.getString("username") || "system"
        });
        $app.save(auditRec);
      }
    } catch (auditErr) {
      console.warn("[Renumber Audit Error]", auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Se renumeraron " + renumberedCount + " documentos de tipo '" + (txType.getString("name") || typePrefix) + "' exitosamente (" + firstNewNumber + " ... " + lastNewNumber + ").",
      renumbered: renumberedCount,
      firstNumber: firstNewNumber,
      lastNumber: lastNewNumber,
      newConsecutive: maxConsecutiveAssigned
    });

  } catch (err) {
    console.error("[Renumber Exception]", err);
    return e.json(500, {
      success: false,
      message: "Error al realizar la renumeración de documentos: " + err.message
    });
  }
});
