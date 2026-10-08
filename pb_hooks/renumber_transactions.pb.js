/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — renumber_transactions.pb.js
 * Utilidad EXCLUSIVA PARA SUPERADMIN:
 * Corrige y renumera masivamente documentos de cualquier tipo en un lapso de tiempo.
 * RESPETA ESTRICTAMENTE la configuración del tipo de documento:
 * - Modo CONTINUO: PREFIJO-00000001 (acumulado continuo)
 * - Modo MENSUAL (period): PREFIJO-AAAAMM-000001 (reinicia por período y actualiza period_counters)
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

  // 2. RESTRICCIÓN EXCLUSIVA A SUPERADMIN
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

  if (role !== "superadmin") {
    return e.json(403, { message: "Acceso denegado: Esta utilidad está restringida exclusivamente a usuarios SUPERADMIN." });
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

  const mode = String(body.mode || "execute").toLowerCase().trim(); // 'preview' | 'execute'
  const category = String(body.category || "transactions").toLowerCase().trim(); // 'transactions' | 'inventory_movements'
  const reqNumberingMode = String(body.numberingMode || "auto").toLowerCase().trim(); // 'auto' | 'period' | 'continuous'
  const startDate = String(body.startDate || "").trim();
  const endDate = String(body.endDate || "").trim();
  const fromNum = body.fromNum !== undefined && body.fromNum !== null && String(body.fromNum).trim() !== "" ? Number(body.fromNum) : null;
  const toNum = body.toNum !== undefined && body.toNum !== null && String(body.toNum).trim() !== "" ? Number(body.toNum) : null;
  const newStartConsecutive = Number(body.newStartConsecutive);
  const syncRelatedDocs = body.syncRelatedDocs !== false;

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
    const db = $app.nonconcurrentDB();

    // =========================================================================
    // CASO A: TRANSACCIONES CONTABLES (transactions)
    // =========================================================================
    if (category === "transactions") {
      const txTypeId = String(body.txTypeId || "").trim();
      if (!txTypeId) {
        return e.json(400, { message: "El tipo de transacción (txTypeId) es obligatorio" });
      }

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

      const typePrefix = String(body.customPrefix || txType.getString("prefix") || txType.getString("code") || "").trim();
      const targetTxTypeId = txType.id;

      // Determinar Modo de Numeración: continuo vs mensual (period)
      const configuredMode = txType.getString("numbering_mode") || "continuous";
      const effectiveMode = (reqNumberingMode === "auto" || !reqNumberingMode) ? configuredMode : reqNumberingMode;
      const isPeriod = effectiveMode === "period";

      const defaultPad = isPeriod ? 6 : (txType.getInt("padding") || 8);
      const padDigits = Number(body.padDigits) || defaultPad;

      let filterStr = "tx_type_id = '" + targetTxTypeId + "'";
      if (startDate && endDate) {
        filterStr += " && date >= '" + startDate + "' && date <= '" + endDate + "'";
      } else if (startDate) {
        filterStr += " && date >= '" + startDate + "'";
      } else if (endDate) {
        filterStr += " && date <= '" + endDate + "'";
      }

      let records = [];
      try {
        records = $app.findRecordsByFilter("transactions", filterStr, "+date, +id", 150000);
      } catch (findErr) {
        console.warn("[Renumber Hook Find Warning]", findErr.message);
      }

      if (!records || records.length === 0) {
        return e.json(200, {
          success: true,
          message: "No se encontraron transacciones de tipo '" + (txType.getString("name") || typePrefix) + "' en el lapso seleccionado.",
          count: 0,
          preview: []
        });
      }

      // Filtrado opcional por rango numérico
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
          message: "No se encontraron transacciones en el rango numérico especificado.",
          count: 0,
          preview: []
        });
      }

      // Procesamiento de numeración respetando continuo vs mensual
      let previewItems = [];
      let monthCounters = {}; // '202607': count
      let existingPeriodCounters = {};
      try {
        existingPeriodCounters = JSON.parse(txType.getString("period_counters") || "{}") || {};
      } catch (_) {}

      let maxContinuousAssigned = newStartConsecutive;
      let anomaliesCount = 0;
      let calculatedRecords = [];

      for (let i = 0; i < filteredRecords.length; i++) {
        const rec = filteredRecords[i];
        const docDate = rec.getString("date") || "";
        const periodTag = docDate.slice(0, 7).replace("-", "") || "GENERAL";

        let currentConsec = 0;
        let newNumber = "";

        if (isPeriod) {
          if (!monthCounters[periodTag]) {
            monthCounters[periodTag] = newStartConsecutive;
          } else {
            monthCounters[periodTag]++;
          }
          currentConsec = monthCounters[periodTag];
          newNumber = typePrefix
            ? (typePrefix + "-" + periodTag + "-" + String(currentConsec).padStart(padDigits, "0"))
            : (periodTag + "-" + String(currentConsec).padStart(padDigits, "0"));
        } else {
          currentConsec = newStartConsecutive + i;
          if (currentConsec > maxContinuousAssigned) maxContinuousAssigned = currentConsec;
          newNumber = typePrefix
            ? (typePrefix + "-" + String(currentConsec).padStart(padDigits, "0"))
            : String(currentConsec);
        }

        const oldNumber = String(rec.getString("number") || rec.get("number") || "");
        
        // Criterios de anomalía:
        // 1. Contiene timestamps residuales como AJ-YYYYMMDD-XXXX
        // 2. Si es mensual y no contiene la etiqueta de su período
        // 3. Cadena vacía, undefined o NaN
        const isAnomalous = /-\d{8}-\d{4}$/.test(oldNumber) ||
                            (isPeriod && !oldNumber.includes(periodTag)) ||
                            !oldNumber ||
                            oldNumber.includes("undefined") ||
                            oldNumber.includes("NaN");

        if (isAnomalous) anomaliesCount++;

        calculatedRecords.push({
          recId: rec.id,
          date: docDate,
          periodTag: periodTag,
          oldNumber: oldNumber,
          newNumber: newNumber,
          description: rec.getString("description") || "",
          isAnomalous: isAnomalous
        });

        if (i < 100 || mode === "preview") {
          previewItems.push({
            id: rec.id,
            date: docDate,
            periodTag: periodTag,
            oldNumber: oldNumber,
            newNumber: newNumber,
            description: rec.getString("description") || "",
            isAnomalous: isAnomalous
          });
        }
      }

      // MODO PREVIEW
      if (mode === "preview") {
        const monthsInvolved = Object.keys(monthCounters);
        return e.json(200, {
          success: true,
          mode: "preview",
          count: filteredRecords.length,
          anomaliesCount: anomaliesCount,
          numberingMode: effectiveMode,
          monthsInvolved: monthsInvolved,
          typeLabel: (txType.getString("name") || typePrefix),
          firstNewNumber: calculatedRecords[0] ? calculatedRecords[0].newNumber : "",
          lastNewNumber: calculatedRecords[calculatedRecords.length - 1] ? calculatedRecords[calculatedRecords.length - 1].newNumber : "",
          preview: previewItems
        });
      }

      // MODO EXECUTE
      let renumberedCount = 0;
      for (let i = 0; i < calculatedRecords.length; i++) {
        const item = calculatedRecords[i];

        // 1. Actualizar transacción
        db.newQuery("UPDATE transactions SET number = {:num} WHERE id = {:id}")
          .bind({ num: item.newNumber, id: item.recId })
          .execute();

        // 2. Sincronizar documentos vinculados si aplica
        if (syncRelatedDocs) {
          try {
            db.newQuery("UPDATE invoices SET tx_number = {:num}, number = CASE WHEN number LIKE 'AJ-%' OR number LIKE 'BORR-%' OR number LIKE 'TEMP-%' THEN {:num} ELSE number END WHERE tx_id = {:id}")
              .bind({ num: item.newNumber, id: item.recId })
              .execute();
          } catch (_) {}

          try {
            db.newQuery("UPDATE purchase_invoices SET tx_number = {:num} WHERE tx_id = {:id}")
              .bind({ num: item.newNumber, id: item.recId })
              .execute();
          } catch (_) {}

          try {
            db.newQuery("UPDATE inventory_movements SET number = CASE WHEN number LIKE 'AJ-%' THEN {:num} ELSE number END WHERE tx_id = {:id}")
              .bind({ num: item.newNumber, id: item.recId })
              .execute();
          } catch (_) {}
        }

        renumberedCount++;
      }

      // 3. Actualizar consecutivos en transaction_types según el modo
      try {
        if (isPeriod) {
          for (const pTag in monthCounters) {
            existingPeriodCounters[pTag] = monthCounters[pTag];
          }
          txType.set("period_counters", JSON.stringify(existingPeriodCounters));
          $app.save(txType);
        } else {
          const currentTypeConsec = Number(txType.getInt("consecutive") || txType.get("consecutive") || 0);
          if (maxContinuousAssigned > currentTypeConsec) {
            txType.set("consecutive", maxContinuousAssigned);
            $app.save(txType);
          }
        }
      } catch (consecErr) {
        console.warn("[Renumber Consecutive Save Warning]", consecErr.message);
      }

      // 4. Registro de Auditoría
      try {
        const auditCol = $app.findCollectionByNameOrId("audit_log");
        if (auditCol) {
          const auditRec = new Record(auditCol, {
            event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
            action:   "SUPERADMIN_RENUMBER_DOCS",
            entity:   "transactions",
            entity_id: targetTxTypeId,
            details:  "Superadmin corrigió " + renumberedCount + " documentos (" + (txType.getString("name") || typePrefix) + "). Modo: " + effectiveMode + ". Rango: " + calculatedRecords[0].newNumber + " a " + calculatedRecords[calculatedRecords.length - 1].newNumber + ". Anomalías: " + anomaliesCount + ".",
            user_id:  authRecord.id,
            username: authRecord.getString("email") || authRecord.getString("username") || "superadmin"
          });
          $app.save(auditRec);
        }
      } catch (auditErr) {
        console.warn("[Renumber Audit Error]", auditErr.message);
      }

      return e.json(200, {
        success: true,
        message: "Se renumeraron y corrigieron exitosamente " + renumberedCount + " documentos de tipo '" + (txType.getString("name") || typePrefix) + "' en modo " + (isPeriod ? "MENSUAL" : "CONTINUO") + " (" + calculatedRecords[0].newNumber + " ... " + calculatedRecords[calculatedRecords.length - 1].newNumber + ").",
        renumbered: renumberedCount,
        numberingMode: effectiveMode,
        anomaliesCount: anomaliesCount,
        firstNumber: calculatedRecords[0].newNumber,
        lastNumber: calculatedRecords[calculatedRecords.length - 1].newNumber
      });
    }

    // =========================================================================
    // CASO B: MOVIMIENTOS DE INVENTARIO (inventory_movements)
    // =========================================================================
    else if (category === "inventory_movements") {
      const movType = String(body.movType || "TODOS").trim().toUpperCase();
      let filterStr = "1=1";
      if (movType && movType !== "TODOS") {
        filterStr += " && mov_type = '" + movType + "'";
      }
      if (startDate && endDate) {
        filterStr += " && date >= '" + startDate + "' && date <= '" + endDate + "'";
      } else if (startDate) {
        filterStr += " && date >= '" + startDate + "'";
      } else if (endDate) {
        filterStr += " && date <= '" + endDate + "'";
      }

      let movs = [];
      try {
        movs = $app.findRecordsByFilter("inventory_movements", filterStr, "+date, +id", 150000);
      } catch (err) {
        console.warn("[Renumber Movs Warning]", err.message);
      }

      if (!movs || movs.length === 0) {
        return e.json(200, {
          success: true,
          message: "No se encontraron movimientos de inventario en el lapso seleccionado.",
          count: 0,
          preview: []
        });
      }

      const defaultPrefix = movType === "ENTRADA" || movType === "AJUSTE_POSITIVO" ? "ENT"
        : (movType === "SALIDA" || movType === "AJUSTE_NEGATIVO" ? "SAL"
        : (movType === "TRASLADO" ? "TRA" : "MOV"));
      const pfx = String(body.customPrefix || defaultPrefix).trim();

      // En Gravy, los movimientos de almacén usan formato mensual por defecto
      const effectiveMode = (reqNumberingMode === "continuous") ? "continuous" : "period";
      const isPeriod = effectiveMode === "period";
      const padDigits = Number(body.padDigits) || (isPeriod ? 4 : 6);

      let previewItems = [];
      let monthCounters = {};
      let maxContinuousAssigned = newStartConsecutive;
      let anomaliesCount = 0;
      let calculatedMovs = [];

      for (let i = 0; i < movs.length; i++) {
        const m = movs[i];
        const docDate = m.getString("date") || "";
        const periodTag = docDate.slice(0, 7).replace("-", "") || "GENERAL";

        let currentConsec = 0;
        let newNum = "";

        if (isPeriod) {
          if (!monthCounters[periodTag]) {
            monthCounters[periodTag] = newStartConsecutive;
          } else {
            monthCounters[periodTag]++;
          }
          currentConsec = monthCounters[periodTag];
          newNum = pfx + "-" + periodTag + "-" + String(currentConsec).padStart(padDigits, "0");
        } else {
          currentConsec = newStartConsecutive + i;
          if (currentConsec > maxContinuousAssigned) maxContinuousAssigned = currentConsec;
          newNum = pfx + "-" + String(currentConsec).padStart(padDigits, "0");
        }

        const oldNum = String(m.getString("number") || m.get("number") || "");
        const isAnomalous = /-\d{8}-\d{4}$/.test(oldNum) ||
                            (isPeriod && !oldNum.includes(periodTag)) ||
                            !oldNum ||
                            oldNum.includes("undefined");

        if (isAnomalous) anomaliesCount++;

        calculatedMovs.push({
          recId: m.id,
          date: docDate,
          periodTag: periodTag,
          oldNumber: oldNum,
          newNumber: newNum,
          description: m.getString("mov_type") + " - " + (m.getString("notes") || ""),
          isAnomalous: isAnomalous
        });

        if (i < 100 || mode === "preview") {
          previewItems.push({
            id: m.id,
            date: docDate,
            periodTag: periodTag,
            oldNumber: oldNum,
            newNumber: newNum,
            description: m.getString("mov_type") + " - " + (m.getString("notes") || ""),
            isAnomalous: isAnomalous
          });
        }
      }

      if (mode === "preview") {
        return e.json(200, {
          success: true,
          mode: "preview",
          count: movs.length,
          anomaliesCount: anomaliesCount,
          numberingMode: effectiveMode,
          monthsInvolved: Object.keys(monthCounters),
          typeLabel: "Movimientos Inventario (" + movType + ")",
          firstNewNumber: calculatedMovs[0] ? calculatedMovs[0].newNumber : "",
          lastNewNumber: calculatedMovs[calculatedMovs.length - 1] ? calculatedMovs[calculatedMovs.length - 1].newNumber : "",
          preview: previewItems
        });
      }

      let renumberedCount = 0;
      for (let i = 0; i < calculatedMovs.length; i++) {
        const item = calculatedMovs[i];
        db.newQuery("UPDATE inventory_movements SET number = {:num} WHERE id = {:id}")
          .bind({ num: item.newNumber, id: item.recId })
          .execute();
        renumberedCount++;
      }

      return e.json(200, {
        success: true,
        message: "Se renumeraron exitosamente " + renumberedCount + " movimientos de inventario en modo " + (isPeriod ? "MENSUAL" : "CONTINUO") + " (" + calculatedMovs[0].newNumber + " ... " + calculatedMovs[calculatedMovs.length - 1].newNumber + ").",
        renumbered: renumberedCount,
        numberingMode: effectiveMode,
        anomaliesCount: anomaliesCount,
        firstNumber: calculatedMovs[0].newNumber,
        lastNumber: calculatedMovs[calculatedMovs.length - 1].newNumber
      });
    }

    return e.json(400, { message: "Categoría de documentos no soportada: " + category });

  } catch (err) {
    console.error("[Renumber Exception]", err);
    return e.json(500, {
      success: false,
      message: "Error al realizar la renumeración de documentos: " + err.message
    });
  }
});
