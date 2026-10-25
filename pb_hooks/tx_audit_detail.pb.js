/**
 * GRAVY - tx_audit_detail.pb.js
 * Provee la trazabilidad real de auditoría de transacciones contables:
 * - Usuario real que digitó/creó el registro inicialmente (nombre completo y correo)
 * - Fecha y hora REAL de digitación/creación en el sistema (independiente de la fecha contable del hecho económico)
 * - Usuario y fecha/hora de última modificación si aplica
 */

routerAdd("GET", "/api/gravy/tx-audit-detail", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { success: false, message: "No autenticado." });
  }

  const txId = String(e.request.url.query().get("tx_id") || "").trim();
  if (!txId) {
    return e.json(400, { success: false, message: "Parámetro tx_id es requerido." });
  }

  try {
    let txRec = null;
    try {
      txRec = $app.findRecordById("transactions", txId);
    } catch (_) {
      return e.json(404, { success: false, message: "Transacción no encontrada." });
    }

    let createLog = null;
    let lastUpdateLog = null;

    try {
      const logs = $app.findRecordsByFilter("audit_log", "entity_id = '" + txId + "'", "event_at ASC", 50);
      for (let i = 0; i < logs.length; i++) {
        const l = logs[i];
        const act = String(l.getString("action") || "").toUpperCase();
        if (act === "CREATE" && !createLog) {
          createLog = l;
        }
        if (act === "UPDATE" || act === "APPROVE" || act === "REVERT_DRAFT") {
          lastUpdateLog = l;
        }
      }
      if (!createLog && logs.length > 0) {
        createLog = logs[0];
      }
    } catch (err) {
      console.log("[tx_audit_detail] Error leyendo audit_log directo:", err);
    }

    // Si aún no encontramos el log de creación, buscar documento origen vinculado (invoices, purchase_invoices)
    let sourceInvoice = null;
    if (!createLog) {
      try {
        sourceInvoice = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        const crossNum = txRec.getString("cross_number");
        if (crossNum) {
          try {
            sourceInvoice = $app.findFirstRecordByFilter("invoices", "number = '" + crossNum + "'");
          } catch (_) {}
        }
      }

      if (sourceInvoice) {
        try {
          const invLogs = $app.findRecordsByFilter("audit_log", "entity_id = '" + sourceInvoice.id + "'", "event_at ASC", 10);
          for (let k = 0; k < invLogs.length; k++) {
            if (String(invLogs[k].getString("action") || "").toUpperCase() === "CREATE") {
              createLog = invLogs[k];
              break;
            }
          }
          if (!createLog && invLogs.length > 0) createLog = invLogs[0];
        } catch (_) {}
      }
    }

    // Resolver creador inicial
    let creatorName = "";
    let creatorEmail = "";
    let creatorUsername = "";
    let realCreatedAt = "";

    if (createLog) {
      realCreatedAt = String(createLog.getString("event_at") || createLog.getString("created") || "");
      creatorUsername = String(createLog.getString("username") || "");
      const uid = String(createLog.getString("user_id") || "");
      if (uid) {
        try {
          const u = $app.findRecordById("users", uid);
          creatorName = String(u.getString("name") || u.getString("full_name") || "");
          creatorEmail = String(u.getString("email") || "");
        } catch (_) {}
      }
    }

    // Fallback con txRec.user_id
    if (!creatorName && txRec.getString("user_id")) {
      try {
        const u = $app.findRecordById("users", txRec.getString("user_id"));
        creatorName = String(u.getString("name") || u.getString("full_name") || "");
        creatorEmail = String(u.getString("email") || "");
      } catch (_) {}
    }

    // Fallback con sourceInvoice
    if (!creatorName && sourceInvoice) {
      const sellerId = String(sourceInvoice.getString("seller_id") || "");
      if (sellerId) {
        try {
          const u = $app.findRecordById("users", sellerId);
          creatorName = String(u.getString("name") || u.getString("full_name") || "");
          creatorEmail = String(u.getString("email") || "");
        } catch (_) {}
      }
      if (!realCreatedAt) {
        realCreatedAt = String(sourceInvoice.getString("created") || "");
      }
    }

    if (!creatorName) {
      creatorName = creatorUsername || "Sistema";
    }

    // Resolver modificador
    let updaterName = "";
    let realUpdatedAt = "";
    if (lastUpdateLog) {
      realUpdatedAt = String(lastUpdateLog.getString("event_at") || lastUpdateLog.getString("created") || "");
      const uid = String(lastUpdateLog.getString("user_id") || "");
      if (uid) {
        try {
          const u = $app.findRecordById("users", uid);
          updaterName = String(u.getString("name") || u.getString("full_name") || "");
        } catch (_) {}
      }
      if (!updaterName) updaterName = String(lastUpdateLog.getString("username") || "");
    }

    return e.json(200, {
      success: true,
      creator_name: creatorName,
      creator_email: creatorEmail,
      creator_username: creatorUsername,
      real_created_at: realCreatedAt,
      updater_name: updaterName,
      real_updated_at: realUpdatedAt,
      accounting_date: txRec.getString("date")
    });
  } catch (err) {
    return e.json(500, { success: false, message: err.message });
  }
});
