/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — audit_engine.pb.js
 *
 * Motor Forense de Auditoría Server-Side:
 * - Asegura la estructura de campos avanzados en 'audit_log' (doc_number, doc_label, amounts, diff, snapshot).
 * - Crea índices optimizados en SQLite para búsquedas instantáneas (<1ms).
 * - Intercepta eventos críticos de negocio (transacciones contables, facturas de venta, compras, terceros).
 * - Calcula automáticamente sumas de débitos y créditos para cumplimiento normativo (Decreto 2420/2015).
 * - Preserva snapshots íntegros de comprobantes contables antes de ser eliminados físicamente.
 */

// ─── 1. BOOTSTRAP: ASEGURAR CAMPOS E ÍNDICES EN BASE DE DATOS ────────────────
onBootstrap((e) => {
  e.next();

  try {
    const auditCol = $app.findCollectionByNameOrId("audit_log");
    if (!auditCol) return;

    const fieldsSet = new Set(auditCol.fields.fieldNames());
    let modified = false;

    if (!fieldsSet.has("doc_number")) {
      auditCol.fields.add(new TextField({ name: "doc_number", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("doc_label")) {
      auditCol.fields.add(new TextField({ name: "doc_label", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("amounts")) {
      auditCol.fields.add(new JSONField({ name: "amounts", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("diff")) {
      auditCol.fields.add(new JSONField({ name: "diff", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("snapshot")) {
      auditCol.fields.add(new JSONField({ name: "snapshot", required: false }));
      modified = true;
    }

    if (modified) {
      $app.save(auditCol);
      console.log("[AuditEngine] Colección audit_log extendida con campos forenses (doc_number, doc_label, amounts, diff, snapshot).");
    }

    // Índices de alta velocidad en SQLite
    try {
      $app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_audit_log_lookup ON audit_log (entity, entity_id, event_at DESC)").execute();
      $app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_audit_log_doc_no ON audit_log (doc_number)").execute();
      $app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_audit_log_event_at ON audit_log (event_at DESC)").execute();
    } catch (idxErr) {
      console.log("[AuditEngine] Aviso al asegurar índices en audit_log: " + idxErr);
    }

  } catch (err) {
    console.log("[AuditEngine] Error en bootstrap de audit_engine: " + err);
  }
});

// ─── 2. HELPERS DEL MOTOR DE AUDITORÍA ────────────────────────────────────────

function _auditExtractActor(e) {
  let auth = null;
  try {
    if (e) {
      if (e.auth) auth = e.auth;
      if (!auth && typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
        const info = $apis.requestInfo(e);
        auth = info?.authRecord || info?.auth;
      }
      if (!auth && e.httpContext) {
        auth = e.httpContext.get("authRecord");
      }
    }
  } catch (_) {}

  const userId = auth ? String(auth.id || "") : "";
  const username = auth
    ? String(auth.getString?.("email") || auth.getString?.("username") || auth.getString?.("name") || userId || "system")
    : "system";

  let remoteIp = "";
  try {
    if (e && typeof e.realIP === "function") {
      remoteIp = String(e.realIP() || "");
    } else if (e && typeof e.remoteIP === "function") {
      remoteIp = String(e.remoteIP() || "");
    }
  } catch (_) {}

  return { userId, username, ip: remoteIp };
}

function _auditWriteRecord(params) {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_log");
    if (!auditCol) return;

    const eventAt = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19);

    const payload = {
      username: String(params.username || "system"),
      action: String(params.action || ""),
      entity: String(params.entity || ""),
      entity_id: String(params.entity_id || ""),
      event_at: eventAt,
      details: String(params.details || "").slice(0, 500),
      ip: String(params.ip || ""),
      doc_number: String(params.doc_number || "").slice(0, 100),
      doc_label: String(params.doc_label || "").slice(0, 100),
    };

    if (params.user_id) payload.user_id = String(params.user_id);
    if (params.amounts) payload.amounts = params.amounts;
    if (params.diff) payload.diff = params.diff;
    if (params.snapshot) payload.snapshot = params.snapshot;

    const rec = new Record(auditCol, payload);
    $app.save(rec);
  } catch (err) {
    console.log("[AuditEngine] Error registrando auditoría: " + err);
  }
}

// ─── 3. INTERCEPTOR: TRANSACCIONES Y ASIENTOS CONTABLES ──────────────────────

onRecordAfterCreateSuccess((e) => {
  if (globalThis.__skipAuditHook) return;
  try {
    const tx = e.record;
    if (!tx) return;

    const actor = _auditExtractActor(e);
    const txNum = String(tx.getString("number") || tx.id);
    const txStatus = String(tx.getString("status") || "active");
    const txDate = String(tx.getString("date") || "");

    // Consultar débitos y créditos agregados de tx_lines
    let sumDebit = 0;
    let sumCredit = 0;
    try {
      const rows = [];
      $app.db().newQuery("SELECT debit, credit FROM tx_lines WHERE tx_id = {:txId}")
        .bind({ txId: tx.id })
        .all(rows);
      for (let i = 0; i < rows.length; i++) {
        sumDebit += Number(rows[i].debit || 0);
        sumCredit += Number(rows[i].credit || 0);
      }
    } catch (_) {}

    _auditWriteRecord({
      user_id: actor.userId,
      username: actor.username,
      ip: actor.ip,
      action: "CREATE",
      entity: "transactions",
      entity_id: tx.id,
      doc_number: txNum,
      doc_label: "Comprobante Contable",
      details: "Comprobante contable " + txNum + " creado (" + txDate + ")",
      amounts: {
        debit: sumDebit,
        credit: sumCredit,
        total: sumDebit,
        balance: Math.abs(sumDebit - sumCredit)
      }
    });
  } catch (err) {
    console.log("[AuditEngine][Tx Create] Error: " + err);
  }
}, "transactions");

onRecordAfterUpdateSuccess((e) => {
  if (globalThis.__skipAuditHook) return;
  try {
    const tx = e.record;
    if (!tx) return;

    const actor = _auditExtractActor(e);
    const txNum = String(tx.getString("number") || tx.id);
    const txStatus = String(tx.getString("status") || "active");

    let action = "UPDATE";
    if (txStatus === "voided") {
      action = "VOID";
    }

    let sumDebit = 0;
    let sumCredit = 0;
    try {
      const rows = [];
      $app.db().newQuery("SELECT debit, credit FROM tx_lines WHERE tx_id = {:txId}")
        .bind({ txId: tx.id })
        .all(rows);
      for (let i = 0; i < rows.length; i++) {
        sumDebit += Number(rows[i].debit || 0);
        sumCredit += Number(rows[i].credit || 0);
      }
    } catch (_) {}

    _auditWriteRecord({
      user_id: actor.userId,
      username: actor.username,
      ip: actor.ip,
      action: action,
      entity: "transactions",
      entity_id: tx.id,
      doc_number: txNum,
      doc_label: "Comprobante Contable",
      details: (action === "VOID" ? "Comprobante " + txNum + " anulado" : "Comprobante " + txNum + " actualizado"),
      amounts: {
        debit: sumDebit,
        credit: sumCredit,
        total: sumDebit,
        balance: Math.abs(sumDebit - sumCredit)
      }
    });
  } catch (err) {
    console.log("[AuditEngine][Tx Update] Error: " + err);
  }
}, "transactions");

onRecordDeleteRequest((e) => {
  try {
    const tx = e.record;
    if (tx) {
      const actor = _auditExtractActor(e);
      const txNum = String(tx.getString("number") || tx.id);

      // Guardar snapshot íntegro de las líneas antes de que desaparezcan de SQLite
      const snapshotLines = [];
      let sumDebit = 0;
      let sumCredit = 0;
      try {
        const rows = [];
        $app.db().newQuery("SELECT account_id, debit, credit, description FROM tx_lines WHERE tx_id = {:txId}")
          .bind({ txId: tx.id })
          .all(rows);
        for (let i = 0; i < rows.length; i++) {
          const deb = Number(rows[i].debit || 0);
          const cred = Number(rows[i].credit || 0);
          sumDebit += deb;
          sumCredit += cred;
          snapshotLines.push({
            account_id: rows[i].account_id,
            debit: deb,
            credit: cred,
            description: rows[i].description
          });
        }
      } catch (_) {}

      _auditWriteRecord({
        user_id: actor.userId,
        username: actor.username,
        ip: actor.ip,
        action: "DELETE",
        entity: "transactions",
        entity_id: tx.id,
        doc_number: txNum,
        doc_label: "Comprobante Contable",
        details: "Eliminación física del comprobante " + txNum + " con " + snapshotLines.length + " líneas contables",
        amounts: {
          debit: sumDebit,
          credit: sumCredit,
          total: sumDebit
        },
        snapshot: {
          header: {
            id: tx.id,
            number: txNum,
            date: tx.getString("date"),
            description: tx.getString("description"),
            status: tx.getString("status")
          },
          lines: snapshotLines
        }
      });
    }
  } catch (err) {
    console.log("[AuditEngine][Tx Delete] Error registrando snapshot de eliminación: " + err);
  }

  e.next();
}, "transactions");

// ─── 4. INTERCEPTOR: FACTURAS DE VENTA (INVOICES) ────────────────────────────

onRecordAfterCreateSuccess((e) => {
  if (globalThis.__skipAuditHook) return;
  try {
    const inv = e.record;
    if (!inv) return;

    const actor = _auditExtractActor(e);
    const invNum = String(inv.getString("number") || inv.id);
    const subtotal = Number(inv.getFloat("subtotal") || 0);
    const total = Number(inv.getFloat("total") || 0);

    _auditWriteRecord({
      user_id: actor.userId,
      username: actor.username,
      ip: actor.ip,
      action: "CREATE",
      entity: "Invoice",
      entity_id: inv.id,
      doc_number: invNum,
      doc_label: "Factura de Venta",
      details: "Factura de venta " + invNum + " emitida por total de " + total,
      amounts: { subtotal: subtotal, total: total }
    });
  } catch (err) {
    console.log("[AuditEngine][Invoice Create] Error: " + err);
  }
}, "invoices");

onRecordAfterUpdateSuccess((e) => {
  if (globalThis.__skipAuditHook) return;
  try {
    const inv = e.record;
    if (!inv) return;

    const actor = _auditExtractActor(e);
    const invNum = String(inv.getString("number") || inv.id);
    const status = String(inv.getString("status") || "active");
    const total = Number(inv.getFloat("total") || 0);

    let action = "UPDATE";
    if (status === "voided") action = "VOID";

    _auditWriteRecord({
      user_id: actor.userId,
      username: actor.username,
      ip: actor.ip,
      action: action,
      entity: "Invoice",
      entity_id: inv.id,
      doc_number: invNum,
      doc_label: "Factura de Venta",
      details: (action === "VOID" ? "Factura de venta " + invNum + " anulada" : "Factura de venta " + invNum + " actualizada"),
      amounts: { total: total }
    });
  } catch (err) {
    console.log("[AuditEngine][Invoice Update] Error: " + err);
  }
}, "invoices");

// ─── 5. INTERCEPTOR: FACTURAS DE COMPRA (PURCHASE_INVOICES) ──────────────────

onRecordAfterCreateSuccess((e) => {
  if (globalThis.__skipAuditHook) return;
  try {
    const pinv = e.record;
    if (!pinv) return;

    const actor = _auditExtractActor(e);
    const pinvNum = String(pinv.getString("number") || pinv.id);
    const total = Number(pinv.getFloat("total") || 0);

    _auditWriteRecord({
      user_id: actor.userId,
      username: actor.username,
      ip: actor.ip,
      action: "CREATE",
      entity: "PurchaseInvoice",
      entity_id: pinv.id,
      doc_number: pinvNum,
      doc_label: "Factura de Compra",
      details: "Factura de compra " + pinvNum + " registrada por total de " + total,
      amounts: { total: total }
    });
  } catch (err) {
    console.log("[AuditEngine][PurchaseInvoice Create] Error: " + err);
  }
}, "purchase_invoices");

// ─── 6. INTERCEPTOR: TERCEROS (THIRD_PARTIES) ────────────────────────────────

onRecordAfterCreateSuccess((e) => {
  if (globalThis.__skipAuditHook) return;
  try {
    const third = e.record;
    if (!third) return;

    const actor = _auditExtractActor(e);
    const nit = String(third.getString("nit") || "");
    const name = String(third.getString("legal_name") || third.getString("name") || "Tercero");

    _auditWriteRecord({
      user_id: actor.userId,
      username: actor.username,
      ip: actor.ip,
      action: "CREATE",
      entity: "Tercero",
      entity_id: third.id,
      doc_number: "NIT " + nit,
      doc_label: "Tercero",
      details: "Creación de tercero: " + name + " (NIT " + nit + ")"
    });
  } catch (err) {
    console.log("[AuditEngine][ThirdParty Create] Error: " + err);
  }
}, "third_parties");

