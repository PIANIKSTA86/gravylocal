/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — bulk_tx.pb.js
 *
 * Endpoints:
 * 1. POST /api/gravy/bulk-tx        — Creación o actualización atómica de 1 transacción + líneas
 * 2. POST /api/gravy/bulk-tx-check  — Pre-chequeo SQL masivo de comprobantes existentes (< 25 ms para 1,000+ números)
 * 3. POST /api/gravy/bulk-tx-batch  — Procesamiento por macro-lotes (Upsert de 100+ comprobantes por transacción SQLite)
 */

routerAdd("POST", "/api/gravy/bulk-tx", (e) => {

  // ─── 1. Autenticación ───────────────────────────────────────────────────────
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { message: "No autenticado. Debes iniciar sesión." });
  }

  // ─── 2. Permisos — misma lógica que la regla de createRule de transactions ──
  let role = "";
  try {
    const colName = authRecord.collection() ? authRecord.collection().name : "";
    if (colName === "_superusers" || colName === "_admins") {
      role = "superadmin";
    } else {
      role = String(authRecord.getString("role") || "").toLowerCase().trim();
    }
  } catch (_) {
    role = String(authRecord.getString("role") || "").toLowerCase().trim();
  }

  const ALLOWED_ROLES = ["superadmin", "administrador", "admin", "contador", "auxiliar"];
  if (!ALLOWED_ROLES.includes(role)) {
    return e.json(403, { message: "No tienes permisos para crear o actualizar transacciones." });
  }

  // ─── 3. Parsear body ────────────────────────────────────────────────────────
  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (parseErr) {
      return e.json(400, { message: "Body inválido: " + parseErr.message });
    }
  }

  const txData  = body && body.txData  ? body.txData  : null;
  const lines   = body && body.lines   ? body.lines   : null;

  if (!txData || typeof txData !== "object") {
    return e.json(400, { message: "Se requiere el campo 'txData'." });
  }
  if (!Array.isArray(lines) || lines.length < 2) {
    return e.json(400, { message: "Se requieren al menos 2 líneas contables en 'lines'." });
  }

  // ─── 3b. IDEMPOTENCIA PURA: Verificación de clave de idempotencia ──────────
  const explicitTxId = String(txData.id || "").trim();
  const allowUpdate = Boolean(body.allow_update || txData.allow_update || explicitTxId);
  const skipPdfArchive = Boolean(body.skip_pdf_archive || txData.skip_pdf_archive);
  const idempotencyKey = String(body.idempotency_key || txData.idempotency_key || "").trim();

  if (idempotencyKey && !allowUpdate) {
    globalThis.__txIdempotencyStore = globalThis.__txIdempotencyStore || {};
    const now = Date.now();
    // Limpiar claves antiguas (> 15 minutos)
    for (const k in globalThis.__txIdempotencyStore) {
      if (now - (globalThis.__txIdempotencyStore[k].time || 0) > 15 * 60 * 1000) {
        delete globalThis.__txIdempotencyStore[k];
      }
    }
    const cached = globalThis.__txIdempotencyStore[idempotencyKey];
    if (cached && cached.data) {
      return e.json(200, Object.assign({}, cached.data, { _idempotent: true }));
    }
  }

  // ─── 3c. IDEMPOTENCIA POR DOCUMENTO DE CRUCE: Prevenir duplicados de factura ──
  const crossType = String(txData.cross_type || "").trim();
  const crossNum = String(txData.cross_number || "").trim();

  if (crossType && crossNum && !explicitTxId && !allowUpdate) {
    try {
      const existingCross = $app.findFirstRecordByFilter(
        "transactions",
        "cross_type = '" + crossType.replace(/'/g, "''") + "' && cross_number = '" + crossNum.replace(/'/g, "''") + "' && status != 'voided'"
      );
      if (existingCross) {
        const existingResult = {
          id: existingCross.id,
          number: existingCross.getString("number"),
          date: existingCross.getString("date"),
          description: existingCross.getString("description"),
          status: existingCross.getString("status"),
          tx_type_id: existingCross.getString("tx_type_id"),
          branch_id: existingCross.getString("branch_id") || null,
          lines_count: lines.length,
          _idempotent: true,
          _cross_matched: true
        };
        if (idempotencyKey) {
          globalThis.__txIdempotencyStore[idempotencyKey] = { time: Date.now(), data: existingResult };
        }
        return e.json(200, existingResult);
      }
    } catch (_) {}
  }

  // ─── 3d. IN-FLIGHT MUTEX: Evitar duplicados por doble clic simultáneo ────────
  const inFlightLockKey = !allowUpdate
    ? (idempotencyKey || (crossType && crossNum ? (crossType + "::" + crossNum) : ""))
    : "";
  if (inFlightLockKey) {
    globalThis.__txInFlight = globalThis.__txInFlight || {};
    let waitLoops = 0;
    while (globalThis.__txInFlight[inFlightLockKey] && waitLoops < 30) {
      if (typeof sleep === "function") {
        sleep(150);
      }
      waitLoops++;
      if (idempotencyKey && globalThis.__txIdempotencyStore && globalThis.__txIdempotencyStore[idempotencyKey]?.data) {
        return e.json(200, Object.assign({}, globalThis.__txIdempotencyStore[idempotencyKey].data, { _idempotent: true }));
      }
      if (crossType && crossNum && !explicitTxId) {
        try {
          const found = $app.findFirstRecordByFilter(
            "transactions",
            "cross_type = '" + crossType.replace(/'/g, "''") + "' && cross_number = '" + crossNum.replace(/'/g, "''") + "' && status != 'voided'"
          );
          if (found) {
            const foundResult = {
              id: found.id,
              number: found.getString("number"),
              date: found.getString("date"),
              description: found.getString("description"),
              status: found.getString("status"),
              tx_type_id: found.getString("tx_type_id"),
              branch_id: found.getString("branch_id") || null,
              lines_count: lines.length,
              _idempotent: true,
              _cross_matched: true
            };
            if (idempotencyKey) {
              globalThis.__txIdempotencyStore = globalThis.__txIdempotencyStore || {};
              globalThis.__txIdempotencyStore[idempotencyKey] = { time: Date.now(), data: foundResult };
            }
            return e.json(200, foundResult);
          }
        } catch (_) {}
      }
    }
    globalThis.__txInFlight[inFlightLockKey] = Date.now();
  }

  // ─── 4. Validaciones básicas de txData ─────────────────────────────────────
  let txRecPre = null;
  if (explicitTxId) {
    try {
      txRecPre = $app.findRecordById("transactions", explicitTxId);
    } catch (_) {}
  }

  const txTypeId = String(txData.tx_type_id || (txRecPre ? txRecPre.getString("tx_type_id") : "")).trim();
  if (!txTypeId) {
    return e.json(400, { message: "tx_type_id es obligatorio." });
  }

  const txDate = String(txData.date || (txRecPre ? txRecPre.getString("date") : "")).trim();
  if (!txDate) {
    return e.json(400, { message: "date es obligatorio (YYYY-MM-DD)." });
  }

  // ─── 5. Limpiar y normalizar branch_id ────────────────────────────────────
  const normalizeBranchId = (val) => {
    const s = String(val || "").trim();
    return /^[a-z0-9]{15}$/.test(s) ? s : null;
  };

  const txBranchId = normalizeBranchId(txData.branch_id) || (txRecPre ? normalizeBranchId(txRecPre.getString("branch_id")) : null);

  // ─── 6. Crear o actualizar transacción + líneas en una única transacción SQLite
  let createdTx = null;
  const prevSkipPdf = Boolean(globalThis.__skipArchivePdfHook);
  globalThis.__skipArchivePdfHook = true;

  try {
    $app.runInTransaction((txApp) => {

      // ── 6a. Resolver número consecutivo y transacción existente ───────────
      let txNumber = String(txData.number || "").trim();
      let txRec = null;

      // Si se especificó id explícito o número de comprobante, verificar si ya existe
      if (explicitTxId) {
        try {
          txRec = txApp.findRecordById("transactions", explicitTxId);
        } catch (_) {}
      }

      if (txRec) {
        if (!txNumber || txNumber === "AUTO") {
          txNumber = txRec.getString("number");
        }
      } else if (!txNumber || txNumber === "AUTO") {
        // Generar consecutivo dentro de la misma transacción SQLite
        // para garantizar unicidad aún bajo carga concurrente.
        const txType = txApp.findRecordById("transaction_types", txTypeId);
        const prefix = String(
          txType.getString("prefix") || txType.getString("code") || "TX"
        ).trim().toUpperCase() || "TX";

        if ((txType.getString("numbering_mode") || "continuous") === "period") {
          const periodTag = txDate.slice(0, 7).replace("-", ""); // "2026-05" -> "202605"
          const counters = JSON.parse(txType.getString("period_counters") || "{}") || {};
          let next = Number(counters[periodTag]) || 0;

          while (true) {
            next++;
            txNumber = `${prefix}-${periodTag}-${String(next).padStart(6, "0")}`;
            let found = false;
            try {
              txApp.findFirstRecordByFilter("transactions", "number = '" + txNumber + "'");
              found = true;
            } catch (_) {}
            if (!found) break;
          }

          counters[periodTag] = next;
          txType.set("period_counters", JSON.stringify(counters));
          txApp.save(txType);
        } else {
          const consecutiveRaw = Number(txType.get("consecutive") || 0);
          let next = Number.isFinite(consecutiveRaw) ? consecutiveRaw : 0;

          while (true) {
            next++;
            txNumber = `${prefix}-${String(next).padStart(8, "0")}`;
            let found = false;
            try {
              txApp.findFirstRecordByFilter("transactions", "number = '" + txNumber + "'");
              found = true;
            } catch (_) {}
            if (!found) break;
          }

          txType.set("consecutive", next);
          txApp.save(txType);
        }
      } else {
        // Si no se encontró por ID, buscar si existe un comprobante con este número
        if (!txRec) {
          try {
            txRec = txApp.findFirstRecordByFilter("transactions", "number = '" + txNumber.replace(/'/g, "''") + "'");
          } catch (_) {}
        }

        if (txRec) {
          const existingStatus = String(txRec.getString("status") || "").trim();
          if (existingStatus === "voided") {
            throw new Error(`El comprobante N° "${txNumber}" se encuentra anulado (voided) y no puede ser modificado.`);
          }
          // Si ya existe un comprobante con este número y NO se autorizó actualización ni es borrador, rechazar
          if (existingStatus !== "draft" && !allowUpdate && (!explicitTxId || txRec.id !== explicitTxId)) {
            throw new Error(`El comprobante N° "${txNumber}" ya existe y se encuentra en estado ${existingStatus}.`);
          }
        }

        // Número explícito: sincronizar consecutivo/contador de periodo para evitar desajustes futuros
        try {
          const parts = txNumber.split("-");
          const txType = txApp.findRecordById("transaction_types", txTypeId);
          const mode = txType.getString("numbering_mode") || "continuous";

          if (mode === "period" && parts.length === 3) {
            const periodTag = parts[1];
            const numPart = parseInt(parts[2], 10);
            if (Number.isFinite(numPart)) {
              const counters = JSON.parse(txType.getString("period_counters") || "{}") || {};
              if (numPart > (counters[periodTag] || 0)) {
                counters[periodTag] = numPart;
                txType.set("period_counters", JSON.stringify(counters));
                txApp.save(txType);
              }
            }
          } else if (mode !== "period" && parts.length === 2) {
            const numPart = parseInt(parts[1], 10);
            if (Number.isFinite(numPart)) {
              const currentConsec = Number(txType.get("consecutive") || 0);
              if (numPart > currentConsec) {
                txType.set("consecutive", numPart);
                txApp.save(txType);
              }
            }
          }
        } catch (_) { /* no crítico */ }
      }

      if (txRec && String(txRec.getString("status") || "").trim() === "voided") {
        throw new Error(`El comprobante N° "${txNumber}" se encuentra anulado (voided) y no puede ser modificado.`);
      }

      // ── 6b. Crear o actualizar cabecera de transacción ────────────────────
      const isExistingUpdate = !!txRec;
      const txCol = txApp.findCollectionByNameOrId("transactions");
      if (!txRec) {
        txRec = new Record(txCol);
      } else {
        // Desvincular referencias de bank_movements para evitar errores de integridad
        try {
          txApp.db().newQuery("UPDATE bank_movements SET tx_line_id = '', reconciled = 0, reconciliation_id = '' WHERE tx_line_id IN (SELECT id FROM tx_lines WHERE tx_id = {:txId})").bind({ txId: txRec.id }).execute();
        } catch (_) {}
        // Eliminar líneas anteriores atómicamente
        try {
          txApp.db().newQuery("DELETE FROM tx_lines WHERE tx_id = {:txId}").bind({ txId: txRec.id }).execute();
        } catch (_) {
          try {
            const oldLines = txApp.findRecordsByFilter("tx_lines", "tx_id = '" + txRec.id + "'");
            for (let k = 0; k < oldLines.length; k++) {
              txApp.delete(oldLines[k]);
            }
          } catch (_) {}
        }
      }

      txRec.set("tx_type_id",    txTypeId);
      txRec.set("number",        txNumber);
      txRec.set("date",          txDate);
      txRec.set("description",   String(txData.description || ""));
      txRec.set("status",        String(txData.status || (isExistingUpdate ? txRec.getString("status") : "active") || "active"));
      if (txData.payment_days != null) {
        txRec.set("payment_days", Number(txData.payment_days || 0));
      } else if (!isExistingUpdate) {
        txRec.set("payment_days", 0);
      }
      txRec.set("cross_enabled", txData.cross_enabled != null ? !!txData.cross_enabled : (isExistingUpdate ? !!txRec.getBool("cross_enabled") : false));

      if (txData.cross_type)    txRec.set("cross_type",    String(txData.cross_type).trim());
      if (txData.cross_number)  txRec.set("cross_number",  String(txData.cross_number).trim());
      if (txData.cross_amount != null) txRec.set("cross_amount", Number(txData.cross_amount || 0));
      if (txData.cross_purpose) txRec.set("cross_purpose", String(txData.cross_purpose).trim());
      if (txData.book_type)     txRec.set("book_type",     String(txData.book_type).trim());

      if (txData.third_party_id !== undefined) {
        txRec.set("third_party_id", txData.third_party_id ? String(txData.third_party_id).trim() : "");
      }
      // Preservar user_id creador original si es actualización y ya tenía uno asignado
      if (!isExistingUpdate || !txRec.getString("user_id")) {
        if (txData.user_id && String(txData.user_id).trim()) {
          txRec.set("user_id", String(txData.user_id).trim());
        }
      }
      if (txBranchId) {
        txRec.set("branch_id", txBranchId);
      }
      if (txData.pos_shift_id && String(txData.pos_shift_id).trim()) {
        txRec.set("pos_shift_id", String(txData.pos_shift_id).trim());
      }
      if (txData.is_import != null) {
        txRec.set("is_import", !!txData.is_import);
      }
      if (txData.import_id && String(txData.import_id).trim()) {
        txRec.set("import_id", String(txData.import_id).trim());
      }
      if (txData.import_invoice_ref != null) {
        txRec.set("import_invoice_ref", String(txData.import_invoice_ref).trim());
      }
      if (txData.import_trm != null && Number(txData.import_trm) > 0) {
        txRec.set("import_trm", Number(txData.import_trm));
      }

      txApp.save(txRec);
      const txId = txRec.id;

      // ── 6c. Crear líneas contables (con caché de cuentas en memoria) ──────
      const linesCol = txApp.findCollectionByNameOrId("tx_lines");
      const accCache = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || {};
        const accountId = String(line.account_id || "").trim();
        if (!accountId) {
          throw new Error(`Línea ${i + 1}: account_id es obligatorio.`);
        }

        let accRec = accCache[accountId] || null;
        if (!accRec) {
          try {
            accRec = txApp.findRecordById("accounts", accountId);
            if (accRec) accCache[accountId] = accRec;
          } catch (_) {}
        }
        if (!accRec) {
          throw new Error(`Línea ${i + 1}: Cuenta contable no encontrada (ID: ${accountId}).`);
        }
        if (accRec.getBool("active") === false) {
          throw new Error(`Línea ${i + 1}: La cuenta "${accRec.getString("code")} - ${accRec.getString("name")}" se encuentra inactiva.`);
        }

        // Sanitización y validación estricta de documento de cruce según maneja_cruce
        const isAccCruce = Boolean(accRec.getBool("maneja_cruce") || accRec.get("maneja_cruce") === true || accRec.get("maneja_cruce") === 1);
        let crossRef = "";
        let crossDocDate = "";
        let dueDate = "";

        if (isAccCruce) {
          crossRef = String(line.cross_doc_ref || "").trim();
          const isSinRef = String(txData.description || "").includes("[SIN_REFERENCIA]");
          if (!crossRef && !isSinRef) {
            throw new Error(`Línea ${i + 1}: La cuenta "${accRec.getString("code")} - ${accRec.getString("name")}" está configurada para uso de documento de cruce. Es obligatorio registrar un documento de cruce.`);
          }
          crossDocDate = String(line.cross_doc_date || "").trim();
          dueDate = String(line.due_date || "").trim();
        } else {
          // Si la cuenta NO maneja cruce, neutralizar cualquier valor residual para evitar contaminación de cartera
          crossRef = "";
          crossDocDate = "";
          dueDate = "";
        }

        // Validación de tercero obligatorio
        const reqThird = Boolean(accRec.getBool("requires_third_party") || accRec.get("requires_third_party") === true || accRec.get("requires_third_party") === 1);
        const lineThird = String(line.third_party_id || "").trim();
        if (reqThird && !lineThird) {
          throw new Error(`Línea ${i + 1}: La cuenta "${accRec.getString("code")} - ${accRec.getString("name")}" requiere tercero obligatorio.`);
        }

        const lineRec = new Record(linesCol);
        lineRec.set("tx_id",          txId);
        lineRec.set("account_id",     accountId);
        lineRec.set("debit",          Number(line.debit  || 0));
        lineRec.set("credit",         Number(line.credit || 0));
        lineRec.set("description",    String(line.description || ""));
        lineRec.set("line_order",     Number(line.line_order != null ? line.line_order : i + 1));
        lineRec.set("cross_doc_ref",  crossRef);
        if (crossDocDate) {
          lineRec.set("cross_doc_date", crossDocDate);
        }
        if (dueDate) {
          lineRec.set("due_date", dueDate);
        }

        const lineBranchId = normalizeBranchId(line.branch_id) || txBranchId;
        if (lineBranchId) {
          lineRec.set("branch_id", lineBranchId);
        }
        if (line.third_party_id && String(line.third_party_id).trim()) {
          lineRec.set("third_party_id", String(line.third_party_id).trim());
        }
        if (line.cost_center_id && String(line.cost_center_id).trim()) {
          lineRec.set("cost_center_id", String(line.cost_center_id).trim());
        }

        // Tracking contable de importación: solo asociar si la línea tiene concepto explícito de importación
        const concept = String(line.import_concept || "").trim();
        const targetImpId = (line.import_id && String(line.import_id).trim()) || (txData.import_id && String(txData.import_id).trim()) || "";
        if (concept && targetImpId) {
          lineRec.set("import_id", targetImpId);
          lineRec.set("import_concept", concept);
          const targetInvRef = (line.import_invoice_ref != null && String(line.import_invoice_ref).trim()) || (txData.import_invoice_ref != null && String(txData.import_invoice_ref).trim()) || "";
          if (targetInvRef) {
            lineRec.set("import_invoice_ref", targetInvRef);
          }
          const targetTrm = Number(line.import_trm || txData.import_trm || 0);
          if (targetTrm > 0) {
            lineRec.set("import_trm", targetTrm);
          }
        } else {
          // Si no tiene concepto, es una contrapartida financiera y no debe vincularse a la importación
          lineRec.set("import_id", "");
          lineRec.set("import_concept", "");
          lineRec.set("import_invoice_ref", "");
          lineRec.set("import_trm", 0);
        }

        txApp.save(lineRec);
      }

      // Capturar el registro creado/actualizado para devolverlo en la respuesta
      createdTx = {
        id:          txRec.id,
        number:      txNumber,
        date:        txDate,
        description: String(txData.description || ""),
        status:      String(txRec.getString("status") || "active"),
        tx_type_id:  txTypeId,
        branch_id:   txBranchId || null,
        lines_count: lines.length,
        _updated:    isExistingUpdate,
      };
    });

    // Disparar archivado físico PDF solo si no fue suprimido por carga masiva
    if (!skipPdfArchive && typeof executeTransactionPdfArchiving === "function" && createdTx && createdTx.id) {
      try {
        const fullTxRec = $app.findRecordById("transactions", createdTx.id);
        if (fullTxRec) executeTransactionPdfArchiving(fullTxRec);
      } catch (archErr) {
        console.error("[bulk-tx ArchivePDF] Error:", archErr);
      }
    }

    // Registrar auditoría server-side de la transacción creada o actualizada
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const userId = String(authRecord.id || "");
      const username = String(
        authRecord.getString?.("email") ||
        authRecord.getString?.("username") ||
        authRecord.getString?.("name") ||
        userId || "system"
      );
      let remoteIp = "";
      try {
        remoteIp = (typeof e?.remoteIP === "function")
          ? String(e.remoteIP() || "")
          : (typeof e?.realIP === "function" ? String(e.realIP() || "") : "");
      } catch (_) {}

      const isUpd = Boolean(createdTx && createdTx._updated);
      const auditPayload = {
        username: username,
        action: isUpd ? "UPDATE" : "CREATE",
        entity: "transactions",
        entity_id: createdTx.id,
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19),
        details: `Transacción ${createdTx.number} ${isUpd ? "actualizada" : "creada"} (${createdTx.lines_count} líneas, fecha ${createdTx.date})`,
        ip: remoteIp,
      };
      if (userId) auditPayload.user_id = userId;

      const logRec = new Record(auditCol, auditPayload);
      $app.save(logRec);
    } catch (auditErr) {
      console.log("[bulk-tx Audit] Aviso:", auditErr);
    }

  } catch (txErr) {
    console.error("[GRAVY bulk-tx] Error procesando transacción:", txErr.message);

    // Distinguir errores de validación (400) de errores internos (500)
    const msg = String(txErr.message || "Error desconocido");
    const isValidationError =
      msg.toLowerCase().includes("obligatorio") ||
      msg.toLowerCase().includes("requerido")   ||
      msg.toLowerCase().includes("required")    ||
      msg.toLowerCase().includes("not found")   ||
      msg.toLowerCase().includes("no encontrad")||
      msg.toLowerCase().includes("unique")      ||
      msg.toLowerCase().includes("duplicad")    ||
      msg.toLowerCase().includes("anulado")     ||
      msg.toLowerCase().includes("voided")      ||
      msg.toLowerCase().includes("ya existe");

    return e.json(isValidationError ? 400 : 500, {
      message: "Error al procesar la transacción: " + msg,
    });
  } finally {
    globalThis.__skipArchivePdfHook = prevSkipPdf;
    if (inFlightLockKey && globalThis.__txInFlight) {
      delete globalThis.__txInFlight[inFlightLockKey];
    }
  }

  // ─── 7. Respuesta exitosa con Idempotencia ────────────────────────────────
  if (idempotencyKey && createdTx && !allowUpdate) {
    globalThis.__txIdempotencyStore = globalThis.__txIdempotencyStore || {};
    globalThis.__txIdempotencyStore[idempotencyKey] = {
      time: Date.now(),
      data: createdTx
    };
  }

  return e.json(200, createdTx);
});

/**
 * Endpoint: POST /api/gravy/bulk-tx-check
 *
 * Verifica en una sola petición ultra-rápida (consulta SQL indexada por bloques)
 * cuáles de los números de comprobante enviados ya existen en la tabla 'transactions'.
 * Ideal para pre-validar archivos de 1,000+ transacciones en < 25 ms.
 */
routerAdd("POST", "/api/gravy/bulk-tx-check", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { message: "No autenticado." });
  }

  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (parseErr) {
      return e.json(400, { message: "Body inválido: " + parseErr.message });
    }
  }

  const rawNumbers = Array.isArray(body.numbers) ? body.numbers : [];
  if (!rawNumbers.length) {
    return e.json(200, { existing: {} });
  }

  const uniqueNums = [];
  const seen = {};
  for (let i = 0; i < rawNumbers.length; i++) {
    const n = String(rawNumbers[i] || "").trim();
    if (n && !seen[n]) {
      seen[n] = true;
      uniqueNums.push(n);
    }
  }

  const existing = {};
  const CHUNK_SIZE = 400;

  for (let offset = 0; offset < uniqueNums.length; offset += CHUNK_SIZE) {
    const chunk = uniqueNums.slice(offset, offset + CHUNK_SIZE);
    const placeholders = [];
    const binds = {};
    for (let j = 0; j < chunk.length; j++) {
      const paramKey = "n" + j;
      placeholders.push("{:" + paramKey + "}");
      binds[paramKey] = chunk[j];
    }

    try {
      const rows = arrayOf(new DynamicModel({
        id: "",
        number: "",
        status: "",
        date: "",
      }));
      $app.db()
        .newQuery("SELECT id, number, status, date FROM transactions WHERE number IN (" + placeholders.join(",") + ")")
        .bind(binds)
        .all(rows);

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (row && row.number) {
          existing[row.number] = {
            id: row.id,
            number: row.number,
            status: row.status,
            date: row.date,
          };
        }
      }
    } catch (_) {
      // Fallback mediante findFirstRecordByFilter si DynamicModel falla
      for (let j = 0; j < chunk.length; j++) {
        try {
          const rec = $app.findFirstRecordByFilter("transactions", "number = '" + chunk[j].replace(/'/g, "''") + "'");
          if (rec) {
            const num = rec.getString("number");
            existing[num] = {
              id: rec.id,
              number: num,
              status: rec.getString("status"),
              date: rec.getString("date"),
            };
          }
        } catch (__) {}
      }
    }
  }

  return e.json(200, { existing: existing });
});

/**
 * Endpoint: POST /api/gravy/bulk-tx-batch
 *
 * Procesa un macro-lote de comprobantes (ej. 100 comprobantes por petición)
 * dentro de una transacción SQLite optimizada con caché de cuentas y tipos
 * de comprobante en RAM y supresión de regeneración síncrona de PDFs.
 * Si un comprobante puntual del lote falla, hace fallback ítem por ítem para
 * aislar el error sin abortar el resto de comprobantes válidos del lote.
 */
routerAdd("POST", "/api/gravy/bulk-tx-batch", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { message: "No autenticado. Debes iniciar sesión." });
  }

  let role = "";
  try {
    const colName = authRecord.collection() ? authRecord.collection().name : "";
    if (colName === "_superusers" || colName === "_admins") {
      role = "superadmin";
    } else {
      role = String(authRecord.getString("role") || "").toLowerCase().trim();
    }
  } catch (_) {
    role = String(authRecord.getString("role") || "").toLowerCase().trim();
  }

  const ALLOWED_ROLES = ["superadmin", "administrador", "admin", "contador", "auxiliar"];
  if (!ALLOWED_ROLES.includes(role)) {
    return e.json(403, { message: "No tienes permisos para importar o actualizar transacciones." });
  }

  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (parseErr) {
      return e.json(400, { message: "Body inválido: " + parseErr.message });
    }
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return e.json(400, { message: "Se requiere un arreglo no vacío en 'items'." });
  }

  const normalizeBranchId = (val) => {
    const s = String(val || "").trim();
    return /^[a-z0-9]{15}$/.test(s) ? s : null;
  };

  const userId = String(authRecord.id || "");
  const username = String(
    authRecord.getString?.("email") ||
    authRecord.getString?.("username") ||
    authRecord.getString?.("name") ||
    userId || "system"
  );
  let remoteIp = "";
  try {
    remoteIp = (typeof e?.remoteIP === "function")
      ? String(e.remoteIP() || "")
      : (typeof e?.realIP === "function" ? String(e.realIP() || "") : "");
  } catch (_) {}

  // Cachés compartidas en RAM durante el lote
  const accCache = {};
  let txColCache = null;
  let linesColCache = null;
  let auditColCache = null;

  const processOneItem = (txApp, item) => {
    const txData = (item && item.txData) || {};
    const lines = Array.isArray(item && item.lines) ? item.lines : [];
    const groupLabel = String(item.group || txData.number || "Comprobante").trim();

    if (lines.length < 2) {
      throw new Error("Se requieren al menos 2 líneas contables.");
    }

    const explicitTxId = String(txData.id || "").trim();
    const allowUpdate = Boolean(body.allow_update !== false && (txData.allow_update !== false));

    let txRec = null;
    if (explicitTxId) {
      try {
        txRec = txApp.findRecordById("transactions", explicitTxId);
      } catch (_) {}
    }

    let txNumber = String(txData.number || "").trim();
    const txTypeId = String(txData.tx_type_id || (txRec ? txRec.getString("tx_type_id") : "")).trim();
    const txDate = String(txData.date || (txRec ? txRec.getString("date") : "")).trim();

    if (!txTypeId) throw new Error("tx_type_id es obligatorio.");
    if (!txDate) throw new Error("date es obligatorio (YYYY-MM-DD).");

    const txBranchId = normalizeBranchId(txData.branch_id) || (txRec ? normalizeBranchId(txRec.getString("branch_id")) : null);

    if (txRec && (!txNumber || txNumber === "AUTO")) {
      txNumber = txRec.getString("number");
    } else if (!txRec && txNumber && txNumber !== "AUTO") {
      try {
        txRec = txApp.findFirstRecordByFilter("transactions", "number = '" + txNumber.replace(/'/g, "''") + "'");
      } catch (_) {}
    }

    if (txRec) {
      const existingStatus = String(txRec.getString("status") || "").trim();
      if (existingStatus === "voided") {
        throw new Error(`El comprobante N° "${txNumber}" se encuentra ANULADO y no puede modificarse.`);
      }
      if (existingStatus !== "draft" && !allowUpdate && (!explicitTxId || txRec.id !== explicitTxId)) {
        throw new Error(`El comprobante N° "${txNumber}" ya existe y se encuentra en estado ${existingStatus}.`);
      }
    }

    // Sincronizar consecutivo si el número es explícito
    if (txNumber && txNumber !== "AUTO") {
      try {
        const parts = txNumber.split("-");
        const txType = txApp.findRecordById("transaction_types", txTypeId);
        const mode = txType.getString("numbering_mode") || "continuous";
        if (mode === "period" && parts.length === 3) {
          const periodTag = parts[1];
          const numPart = parseInt(parts[2], 10);
          if (Number.isFinite(numPart)) {
            const counters = JSON.parse(txType.getString("period_counters") || "{}") || {};
            if (numPart > (counters[periodTag] || 0)) {
              counters[periodTag] = numPart;
              txType.set("period_counters", JSON.stringify(counters));
              txApp.save(txType);
            }
          }
        } else if (mode !== "period" && parts.length === 2) {
          const numPart = parseInt(parts[1], 10);
          if (Number.isFinite(numPart)) {
            const currentConsec = Number(txType.get("consecutive") || 0);
            if (numPart > currentConsec) {
              txType.set("consecutive", numPart);
              txApp.save(txType);
            }
          }
        }
      } catch (_) {}
    }

    const isExistingUpdate = !!txRec;
    if (!txColCache) txColCache = txApp.findCollectionByNameOrId("transactions");
    if (!linesColCache) linesColCache = txApp.findCollectionByNameOrId("tx_lines");

    if (!txRec) {
      txRec = new Record(txColCache);
    } else {
      try {
        txApp.db().newQuery("UPDATE bank_movements SET tx_line_id = '', reconciled = 0, reconciliation_id = '' WHERE tx_line_id IN (SELECT id FROM tx_lines WHERE tx_id = {:txId})").bind({ txId: txRec.id }).execute();
      } catch (_) {}
      try {
        txApp.db().newQuery("DELETE FROM tx_lines WHERE tx_id = {:txId}").bind({ txId: txRec.id }).execute();
      } catch (_) {
        try {
          const oldLines = txApp.findRecordsByFilter("tx_lines", "tx_id = '" + txRec.id + "'");
          for (let k = 0; k < oldLines.length; k++) {
            txApp.delete(oldLines[k]);
          }
        } catch (__) {}
      }
    }

    txRec.set("tx_type_id", txTypeId);
    txRec.set("number", txNumber);
    txRec.set("date", txDate);
    txRec.set("description", String(txData.description || ""));
    txRec.set("status", String(txData.status || (isExistingUpdate ? txRec.getString("status") : "active") || "active"));
    if (txData.payment_days != null) {
      txRec.set("payment_days", Number(txData.payment_days || 0));
    } else if (!isExistingUpdate) {
      txRec.set("payment_days", 0);
    }
    txRec.set("cross_enabled", txData.cross_enabled != null ? !!txData.cross_enabled : (isExistingUpdate ? !!txRec.getBool("cross_enabled") : false));

    if (txData.cross_type) txRec.set("cross_type", String(txData.cross_type).trim());
    if (txData.cross_number) txRec.set("cross_number", String(txData.cross_number).trim());
    if (txData.cross_amount != null) txRec.set("cross_amount", Number(txData.cross_amount || 0));
    if (txData.cross_purpose) txRec.set("cross_purpose", String(txData.cross_purpose).trim());
    if (txData.book_type) txRec.set("book_type", String(txData.book_type).trim());

    if (txData.third_party_id !== undefined) {
      txRec.set("third_party_id", txData.third_party_id ? String(txData.third_party_id).trim() : "");
    }
    if (!isExistingUpdate || !txRec.getString("user_id")) {
      if (txData.user_id && String(txData.user_id).trim()) {
        txRec.set("user_id", String(txData.user_id).trim());
      }
    }
    if (txBranchId) {
      txRec.set("branch_id", txBranchId);
    }
    if (txData.pos_shift_id && String(txData.pos_shift_id).trim()) {
      txRec.set("pos_shift_id", String(txData.pos_shift_id).trim());
    }
    if (txData.is_import != null) {
      txRec.set("is_import", !!txData.is_import);
    }
    if (txData.import_id && String(txData.import_id).trim()) {
      txRec.set("import_id", String(txData.import_id).trim());
    }
    if (txData.import_invoice_ref != null) {
      txRec.set("import_invoice_ref", String(txData.import_invoice_ref).trim());
    }
    if (txData.import_trm != null && Number(txData.import_trm) > 0) {
      txRec.set("import_trm", Number(txData.import_trm));
    }

    txApp.save(txRec);
    const txId = txRec.id;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || {};
      const accountId = String(line.account_id || "").trim();
      if (!accountId) {
        throw new Error(`Línea ${i + 1}: account_id es obligatorio.`);
      }

      let accRec = accCache[accountId] || null;
      if (!accRec) {
        try {
          accRec = txApp.findRecordById("accounts", accountId);
          if (accRec) accCache[accountId] = accRec;
        } catch (_) {}
      }
      if (!accRec) {
        throw new Error(`Línea ${i + 1}: Cuenta contable no encontrada (ID: ${accountId}).`);
      }
      if (accRec.getBool("active") === false) {
        throw new Error(`Línea ${i + 1}: La cuenta "${accRec.getString("code")} - ${accRec.getString("name")}" se encuentra inactiva.`);
      }

      const isAccCruce = Boolean(accRec.getBool("maneja_cruce") || accRec.get("maneja_cruce") === true || accRec.get("maneja_cruce") === 1);
      let crossRef = "";
      let crossDocDate = "";
      let dueDate = "";

      if (isAccCruce) {
        crossRef = String(line.cross_doc_ref || "").trim();
        const isSinRef = String(txData.description || "").includes("[SIN_REFERENCIA]");
        if (!crossRef && !isSinRef) {
          throw new Error(`Línea ${i + 1}: La cuenta "${accRec.getString("code")} - ${accRec.getString("name")}" requiere documento de cruce obligatorio.`);
        }
        crossDocDate = String(line.cross_doc_date || "").trim();
        dueDate = String(line.due_date || "").trim();
      }

      const reqThird = Boolean(accRec.getBool("requires_third_party") || accRec.get("requires_third_party") === true || accRec.get("requires_third_party") === 1);
      const lineThird = String(line.third_party_id || "").trim();
      if (reqThird && !lineThird) {
        throw new Error(`Línea ${i + 1}: La cuenta "${accRec.getString("code")} - ${accRec.getString("name")}" requiere tercero obligatorio.`);
      }

      const lineRec = new Record(linesColCache);
      lineRec.set("tx_id", txId);
      lineRec.set("account_id", accountId);
      lineRec.set("debit", Number(line.debit || 0));
      lineRec.set("credit", Number(line.credit || 0));
      lineRec.set("description", String(line.description || ""));
      lineRec.set("line_order", Number(line.line_order != null ? line.line_order : i + 1));
      lineRec.set("cross_doc_ref", crossRef);
      if (crossDocDate) lineRec.set("cross_doc_date", crossDocDate);
      if (dueDate) lineRec.set("due_date", dueDate);

      const lineBranchId = normalizeBranchId(line.branch_id) || txBranchId;
      if (lineBranchId) lineRec.set("branch_id", lineBranchId);
      if (lineThird) lineRec.set("third_party_id", lineThird);
      if (line.cost_center_id && String(line.cost_center_id).trim()) {
        lineRec.set("cost_center_id", String(line.cost_center_id).trim());
      }

      const concept = String(line.import_concept || "").trim();
      const targetImpId = (line.import_id && String(line.import_id).trim()) || (txData.import_id && String(txData.import_id).trim()) || "";
      if (concept && targetImpId) {
        lineRec.set("import_id", targetImpId);
        lineRec.set("import_concept", concept);
        const targetInvRef = (line.import_invoice_ref != null && String(line.import_invoice_ref).trim()) || (txData.import_invoice_ref != null && String(txData.import_invoice_ref).trim()) || "";
        if (targetInvRef) lineRec.set("import_invoice_ref", targetInvRef);
        const targetTrm = Number(line.import_trm || txData.import_trm || 0);
        if (targetTrm > 0) lineRec.set("import_trm", targetTrm);
      } else {
        lineRec.set("import_id", "");
        lineRec.set("import_concept", "");
        lineRec.set("import_invoice_ref", "");
        lineRec.set("import_trm", 0);
      }

      txApp.save(lineRec);
    }

    // Registrar auditoría dentro de la misma transacción
    try {
      if (!auditColCache) auditColCache = txApp.findCollectionByNameOrId("audit_log");
      const auditPayload = {
        username: username,
        action: isExistingUpdate ? "UPDATE" : "CREATE",
        entity: "transactions",
        entity_id: txId,
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19),
        details: `Transacción ${txNumber} ${isExistingUpdate ? "actualizada" : "creada"} por carga masiva (${lines.length} líneas, fecha ${txDate})`,
        ip: remoteIp,
      };
      if (userId) auditPayload.user_id = userId;
      const logRec = new Record(auditColCache, auditPayload);
      txApp.save(logRec);
    } catch (_) {}

    return {
      id: txId,
      number: txNumber,
      group: groupLabel,
      _updated: isExistingUpdate,
    };
  };

  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors = [];
  const results = [];

  const prevSkipPdf = Boolean(globalThis.__skipArchivePdfHook);
  globalThis.__skipArchivePdfHook = true;

  try {
    // Intento 1: Ejecutar todo el macro-lote en UNA SOLA transacción SQLite (máxima velocidad)
    let batchResults = [];
    let batchSuccess = false;
    try {
      $app.runInTransaction((txApp) => {
        batchResults = [];
        for (let idx = 0; idx < items.length; idx++) {
          const resItem = processOneItem(txApp, items[idx]);
          batchResults.push(resItem);
        }
      });
      batchSuccess = true;
    } catch (batchErr) {
      batchSuccess = false;
    }

    if (batchSuccess) {
      for (let k = 0; k < batchResults.length; k++) {
        const r = batchResults[k];
        if (r._updated) updated++;
        else created++;
        results.push(r);
      }
    } else {
      // Fallback aislado: si algún comprobante del lote falló, procesar ítem por ítem
      // para que los otros comprobantes válidos del lote se guarden y solo falle el inválido
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx] || {};
        const groupLabel = String(item.group || item.txData?.number || `#${idx + 1}`).trim();
        try {
          let singleRes = null;
          $app.runInTransaction((txApp) => {
            singleRes = processOneItem(txApp, item);
          });
          if (singleRes) {
            if (singleRes._updated) updated++;
            else created++;
            results.push(singleRes);
          }
        } catch (itemErr) {
          failed++;
          errors.push(`${groupLabel}: ${itemErr.message || String(itemErr)}`);
        }
      }
    }
  } finally {
    globalThis.__skipArchivePdfHook = prevSkipPdf;
  }

  return e.json(200, {
    created: created,
    updated: updated,
    failed: failed,
    errors: errors,
    results: results,
  });
});
