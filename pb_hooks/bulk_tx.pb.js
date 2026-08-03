/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — bulk_tx.pb.js
 *
 * Endpoint: POST /api/gravy/bulk-tx
 *
 * Crea una transacción contable con TODAS sus líneas en una sola
 * transacción SQLite atómica. Resuelve el problema de timeout
 * cuando se importan comprobantes con muchas líneas (ej: saldos iniciales
 * con 100+ cuentas), ya que el método anterior hacía 1 HTTP request por línea.
 *
 * Body esperado:
 * {
 *   txData: {
 *     tx_type_id: string,   // ID del tipo de transacción (requerido)
 *     number:     string,   // "AUTO" para generar consecutivo, o número explícito
 *     date:       string,   // YYYY-MM-DD
 *     description: string,
 *     third_party_id?: string,
 *     payment_days?: number,
 *     cross_enabled?: boolean,
 *     status?: string,      // "active" | "draft"
 *     branch_id?: string,
 *     user_id?: string,
 *   },
 *   lines: [{
 *     account_id:    string,   // requerido
 *     debit:         number,
 *     credit:        number,
 *     description?:  string,
 *     line_order?:   number,
 *     third_party_id?: string,
 *     cross_doc_ref?: string,
 *     branch_id?:    string,
 *   }]
 * }
 *
 * Respuesta exitosa 200:
 * { id, number, date, description, ... }  — el registro de la transacción creado.
 *
 * Errores:
 * 400 — payload inválido o validación fallida
 * 401 — sin autenticación
 * 403 — sin permisos
 * 500 — error interno
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
    return e.json(403, { message: "No tienes permisos para crear transacciones." });
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

  // ─── 4. Validaciones básicas de txData ─────────────────────────────────────
  const txTypeId = String(txData.tx_type_id || "").trim();
  if (!txTypeId) {
    return e.json(400, { message: "tx_type_id es obligatorio." });
  }

  const txDate = String(txData.date || "").trim();
  if (!txDate) {
    return e.json(400, { message: "date es obligatorio (YYYY-MM-DD)." });
  }

  // ─── 5. Limpiar y normalizar branch_id ────────────────────────────────────
  const normalizeBranchId = (val) => {
    const s = String(val || "").trim();
    return /^[a-z0-9]{15}$/.test(s) ? s : null;
  };

  const txBranchId = normalizeBranchId(txData.branch_id);

  // ─── 6. Crear transacción + líneas en una única transacción SQLite ──────────
  let createdTx = null;

  try {
    $app.runInTransaction((txApp) => {

      // ── 6a. Resolver número consecutivo y transacción existente ───────────
      let txNumber = String(txData.number || "AUTO").trim();
      let txRec = null;

      // Si se especificó id explícito o número de comprobante, verificar si ya existe
      if (txData.id && String(txData.id).trim()) {
        try {
          txRec = txApp.findRecordById("transactions", String(txData.id).trim());
        } catch (_) {}
      }

      if (!txNumber || txNumber === "AUTO") {
        // Generar consecutivo dentro de la misma transacción SQLite
        // para garantizar unicidad aún bajo carga concurrente.
        const txType = txApp.findRecordById("transaction_types", txTypeId);
        const prefix = String(
          txType.getString("prefix") || txType.getString("code") || "TX"
        ).trim().toUpperCase() || "TX";

        const consecutiveRaw = Number(txType.get("consecutive") || 0);
        const next = (Number.isFinite(consecutiveRaw) ? consecutiveRaw : 0) + 1;

        txType.set("consecutive", next);
        txApp.save(txType);

        txNumber = `${prefix}-${String(next).padStart(8, "0")}`;
      } else {
        // Si no se encontró por ID, buscar si existe un borrador con este número
        if (!txRec) {
          try {
            txRec = txApp.findFirstRecordByFilter("transactions", "number = '" + txNumber + "'");
          } catch (_) {}
        }

        // Si ya existe un comprobante con este número y NO está en borrador, reject
        if (txRec && txRec.getString("status") !== "draft" && (!txData.id || txRec.id !== String(txData.id).trim())) {
          throw new Error(`El comprobante N° "${txNumber}" ya existe y se encuentra en estado ${txRec.getString("status")}.`);
        }

        // Número explícito: sincronizar consecutivo para evitar desajustes futuros
        try {
          const parts = txNumber.split("-");
          if (parts.length === 2) {
            const numPart = parseInt(parts[1], 10);
            if (Number.isFinite(numPart)) {
              const txType = txApp.findRecordById("transaction_types", txTypeId);
              const currentConsec = Number(txType.get("consecutive") || 0);
              if (numPart > currentConsec) {
                txType.set("consecutive", numPart);
                txApp.save(txType);
              }
            }
          }
        } catch (_) { /* no crítico */ }
      }

      // ── 6b. Crear o actualizar cabecera de transacción ────────────────────
      const txCol = txApp.findCollectionByNameOrId("transactions");
      if (!txRec) {
        txRec = new Record(txCol);
      } else {
        // Si estamos actualizando una transacción en borrador, eliminar líneas anteriores
        try {
          const oldLines = txApp.findRecordsByFilter("tx_lines", "tx_id = '" + txRec.id + "'");
          for (let k = 0; k < oldLines.length; k++) {
            txApp.delete(oldLines[k]);
          }
        } catch (_) {}
      }

      txRec.set("tx_type_id",    txTypeId);
      txRec.set("number",        txNumber);
      txRec.set("date",          txDate);
      txRec.set("description",   String(txData.description || ""));
      txRec.set("status",        String(txData.status || "active"));
      txRec.set("payment_days",  Number(txData.payment_days || 0));
      txRec.set("cross_enabled", !!txData.cross_enabled);

      if (txData.cross_type)    txRec.set("cross_type",    String(txData.cross_type).trim());
      if (txData.cross_number)  txRec.set("cross_number",  String(txData.cross_number).trim());
      if (txData.cross_amount != null) txRec.set("cross_amount", Number(txData.cross_amount || 0));
      if (txData.cross_purpose) txRec.set("cross_purpose", String(txData.cross_purpose).trim());

      if (txData.third_party_id && String(txData.third_party_id).trim()) {
        txRec.set("third_party_id", String(txData.third_party_id).trim());
      }
      if (txData.user_id && String(txData.user_id).trim()) {
        txRec.set("user_id", String(txData.user_id).trim());
      }
      if (txBranchId) {
        txRec.set("branch_id", txBranchId);
      }
      if (txData.pos_shift_id && String(txData.pos_shift_id).trim()) {
        txRec.set("pos_shift_id", String(txData.pos_shift_id).trim());
      }

      txApp.save(txRec);
      const txId = txRec.id;

      // ── 6c. Crear líneas contables ────────────────────────────────────────
      const linesCol = txApp.findCollectionByNameOrId("tx_lines");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || {};
        const accountId = String(line.account_id || "").trim();
        if (!accountId) {
          throw new Error(`Línea ${i + 1}: account_id es obligatorio.`);
        }

        const lineRec = new Record(linesCol);
        lineRec.set("tx_id",          txId);
        lineRec.set("account_id",     accountId);
        lineRec.set("debit",          Number(line.debit  || 0));
        lineRec.set("credit",         Number(line.credit || 0));
        lineRec.set("description",    String(line.description || ""));
        lineRec.set("line_order",     Number(line.line_order != null ? line.line_order : i + 1));
        lineRec.set("cross_doc_ref",  String(line.cross_doc_ref || ""));
        if (line.cross_doc_date) {
          lineRec.set("cross_doc_date", String(line.cross_doc_date || "").trim());
        }
        if (line.due_date) {
          lineRec.set("due_date", String(line.due_date || "").trim());
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

        txApp.save(lineRec);
      }

      // Capturar el registro creado para devolverlo en la respuesta
      createdTx = {
        id:          txRec.id,
        number:      txNumber,
        date:        txDate,
        description: String(txData.description || ""),
        status:      String(txData.status || "active"),
        tx_type_id:  txTypeId,
        branch_id:   txBranchId || null,
        lines_count: lines.length,
      };
    });

    // Disparar archivado físico PDF si la función existe
    if (typeof executeTransactionPdfArchiving === "function" && createdTx && createdTx.id) {
      try {
        const fullTxRec = $app.findRecordById("transactions", createdTx.id);
        if (fullTxRec) executeTransactionPdfArchiving(fullTxRec);
      } catch (archErr) {
        console.error("[bulk-tx ArchivePDF] Error:", archErr);
      }
    }

  } catch (txErr) {
    console.error("[GRAVY bulk-tx] Error creando transacción:", txErr.message);

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
      msg.toLowerCase().includes("ya existe");

    return e.json(isValidationError ? 400 : 500, {
      message: "Error al crear la transacción: " + msg,
    });
  }

  // ─── 7. Respuesta exitosa ───────────────────────────────────────────────────
  return e.json(200, createdTx);
});
