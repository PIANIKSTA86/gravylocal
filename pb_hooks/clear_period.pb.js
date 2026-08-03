/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — clear_period.pb.js
 * Endpoint de limpieza de transacciones y documentos por período de fechas.
 * Disponible para administradores (ADMIN y SUPERADMIN).
 * Reversa consecutivos y ajusta saldos e inventarios correspondientes.
 *
 * NOTA: Las funciones helper están declaradas ANTES del routerAdd porque el
 * runtime de PocketBase (Goja) no hace hoisting de funciones globales.
 */

// ── ENDPOINT PRINCIPAL ────────────────────────────────────────────────────────
routerAdd("POST", "/api/gravy/clear-period", (e) => {
  // ── RECALCULO DE STOCK ────────────────────────────────────────────────────────
  function _cpAdjustStock(txApp, stockMap, prodId, whId, delta) {
    if (!prodId || !whId) return;
    const key = prodId + "_" + whId;
    let st = stockMap[key];
    if (!st) {
      try {
        const col = txApp.findCollectionByNameOrId("inventory_stock");
        st = new Record(col, {
          product_id: prodId, warehouse_id: whId,
          qty_on_hand: 0, avg_cost: 0,
          last_mov_date: new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10)
        });
        stockMap[key] = st;
      } catch (err) { console.warn("[Clear Period] adjustStock error: " + err.message); return; }
    }
    st.set("qty_on_hand", (st.getFloat("qty_on_hand") || 0) + delta);
    txApp.save(st);
  }

  function _cpRecalculateAllStock(txApp) {
    console.log("[GRAVY-STOCK-RECALC] Iniciando recalculación de stock...");

    let stocks = [];
    try { stocks = txApp.findRecordsByFilter("inventory_stock", "1=1", "", 150000); } catch(_) {}

    const stockMap = {};
    for (let i = 0; i < stocks.length; i++) {
      const st = stocks[i];
      st.set("qty_on_hand", 0);
      txApp.save(st);
      stockMap[st.getString("product_id") + "_" + st.getString("warehouse_id")] = st;
    }

    let movements = [];
    try {
      movements = txApp.findRecordsByFilter("inventory_movements", "status = 'applied'", "date asc, id asc", 150000);
    } catch(_) {}

    for (let i = 0; i < movements.length; i++) {
      const mov      = movements[i];
      const movId    = mov.id;
      const movType  = mov.getString("mov_type");
      const whId     = mov.getString("warehouse_id");
      const destWhId = mov.getString("dest_warehouse_id");

      let lines = [];
      try { lines = txApp.findRecordsByFilter("inventory_movement_lines", "movement_id = '" + movId + "'", "line_order asc", 5000); } catch(_) {}

      for (let j = 0; j < lines.length; j++) {
        const line   = lines[j];
        const prodId = line.getString("product_id");
        const qty    = line.getFloat("qty") || 0;

        if (movType === "ENTRADA" || movType === "AJUSTE_POSITIVO") {
          _cpAdjustStock(txApp, stockMap, prodId, whId, qty);
        } else if (movType === "SALIDA" || movType === "AJUSTE_NEGATIVO") {
          _cpAdjustStock(txApp, stockMap, prodId, whId, -qty);
        } else if (movType === "TRASLADO") {
          _cpAdjustStock(txApp, stockMap, prodId, whId, -qty);
          if (destWhId) _cpAdjustStock(txApp, stockMap, prodId, destWhId, qty);
        }
      }
    }
    console.log("[GRAVY-STOCK-RECALC] Completada.");
  }

  // ── RECALCULO DE CONSECUTIVOS ─────────────────────────────────────────────────
  function _cpRecalculateConsecutives(txApp, selections) {
    // 1. Tipos de transacción (comprobantes contables)
    if (selections.transactions) {
      let txTypes = [];
      try { txTypes = txApp.findRecordsByFilter("transaction_types", "1=1", "", 5000); } catch(_) {}

      for (let i = 0; i < txTypes.length; i++) {
        const tt   = txTypes[i];
        const ttId = tt.id;
        const code = tt.getString("code");

        let remaining = [];
        try { remaining = txApp.findRecordsByFilter("transactions", "tx_type_id = '" + ttId + "'", "", 150000); } catch(_) {}

        let maxConsec = 0;
        for (let j = 0; j < remaining.length; j++) {
          const numStr  = remaining[j].getString("number") || "";
          const parts   = numStr.split("-");
          const numPart = parseInt(parts[parts.length - 1], 10);
          if (Number.isFinite(numPart) && numPart > maxConsec) maxConsec = numPart;
        }
        tt.set("consecutive", maxConsec);
        txApp.save(tt);
        console.log("[GRAVY-CONSECUTIVOS] Tipo Tx (" + code + ") -> " + maxConsec);
      }
    }

    // 2. Resoluciones DIAN (facturas y documentos soporte)
    if (selections.invoices || selections.purchase_invoices) {
      let resolutions = [];
      try { resolutions = txApp.findRecordsByFilter("dian_resolutions", "1=1", "", 5000); } catch(_) {}

      for (let i = 0; i < resolutions.length; i++) {
        const res        = resolutions[i];
        const docType    = res.getString("document_type");
        const prefix     = res.getString("prefix");
        const numberFrom = res.getInt("number_from") || 1;
        let maxNum = numberFrom - 1;

        if ((docType === "FV" || docType === "POS" || docType === "NC" || docType === "ND") && selections.invoices) {
          let filter = "1=1";
          if (prefix) filter = "number ~ '" + prefix + "-'";
          let invs = [];
          try { invs = txApp.findRecordsByFilter("invoices", filter, "", 150000); } catch(_) {}
          for (let j = 0; j < invs.length; j++) {
            const parts   = (invs[j].getString("number") || "").split("-");
            const numPart = parseInt(parts[parts.length - 1], 10);
            if (Number.isFinite(numPart) && numPart > maxNum) maxNum = numPart;
          }
          res.set("current_number", maxNum);
          txApp.save(res);
          console.log("[GRAVY-CONSECUTIVOS] Resolución DIAN (" + docType + "|" + prefix + ") -> " + maxNum);

        } else if ((docType === "DS" || docType === "NDS") && selections.purchase_invoices) {
          let filter = "1=1";
          if (prefix) filter = "number ~ '" + prefix + "-'";
          let pinvs = [];
          try { pinvs = txApp.findRecordsByFilter("purchase_invoices", filter, "", 150000); } catch(_) {}
          for (let j = 0; j < pinvs.length; j++) {
            const parts   = (pinvs[j].getString("number") || "").split("-");
            const numPart = parseInt(parts[parts.length - 1], 10);
            if (Number.isFinite(numPart) && numPart > maxNum) maxNum = numPart;
          }
          res.set("current_number", maxNum);
          txApp.save(res);
          console.log("[GRAVY-CONSECUTIVOS] Resolución DIAN (" + docType + "|" + prefix + ") -> " + maxNum);
        }
      }
    }
  }

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

  // 3. Obtener parámetros
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}

  const startDate  = String(body.startDate  || "").trim();
  const endDate    = String(body.endDate    || "").trim();
  const selections = body.selections || {};

  if (!startDate || !endDate) {
    return e.json(400, { message: "Fecha de inicio y fecha de fin son obligatorias" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return e.json(400, { message: "Las fechas deben tener el formato YYYY-MM-DD" });
  }
  if (startDate > endDate) {
    return e.json(400, { message: "La fecha de inicio no puede ser posterior a la fecha de fin" });
  }

  let clearedCount = 0;
  const affectedModules = [];
  const db = $app.nonconcurrentDB();

  // ── FASE 1: Romper FK opcionales con SQL raw ANTES de la transacción ──────
  try {
    const s  = startDate;
    const en = endDate;

    const txTypeIds = Array.isArray(selections.tx_type_ids) ? selections.tx_type_ids.filter(Boolean) : [];
    let txSubquery = `SELECT id FROM transactions WHERE date >= '${s}' AND date <= '${en}'`;
    let txLineSubquery = `SELECT tl.id FROM tx_lines tl INNER JOIN transactions t ON t.id = tl.tx_id WHERE t.date >= '${s}' AND t.date <= '${en}'`;
    
    if (txTypeIds.length > 0) {
      const idsStr = txTypeIds.map(id => `'${id}'`).join(',');
      txSubquery += ` AND tx_type_id IN (${idsStr})`;
      txLineSubquery += ` AND t.tx_type_id IN (${idsStr})`;
    }

    if (selections.payroll) {
      try { db.newQuery(`UPDATE transactions SET payroll_period_id = '' WHERE EXISTS (SELECT 1 FROM payroll_periods pp WHERE pp.id = transactions.payroll_period_id AND pp.date_from >= '${s}' AND pp.date_to <= '${en}')`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE invoices SET payroll_period_id = '' WHERE EXISTS (SELECT 1 FROM payroll_periods pp WHERE pp.id = invoices.payroll_period_id AND pp.date_from >= '${s}' AND pp.date_to <= '${en}')`).execute(); } catch(_) {}
    }
    if (selections.inventory_movements) {
      try { db.newQuery(`UPDATE invoices SET inv_movement_id = '' WHERE inv_movement_id IN (SELECT id FROM inventory_movements WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE purchase_invoices SET inv_movement_id = '' WHERE inv_movement_id IN (SELECT id FROM inventory_movements WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
    }
    if (selections.purchase_invoices) {
      try { db.newQuery(`UPDATE imports SET purchase_invoice_id = '' WHERE purchase_invoice_id IN (SELECT id FROM purchase_invoices WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
    }
    if (selections.invoices) {
      try { db.newQuery(`UPDATE sales_orders SET invoice_id = '' WHERE invoice_id IN (SELECT id FROM invoices WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE sales_reservations SET invoice_id = '' WHERE invoice_id IN (SELECT id FROM invoices WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE logistica_deliveries SET invoice_id = '' WHERE invoice_id IN (SELECT id FROM invoices WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE crm_deals SET invoice_id = '' WHERE invoice_id IN (SELECT id FROM invoices WHERE date >= '${s}' AND date <= '${en}')`).execute(); } catch(_) {}
    }
    if (selections.transactions) {
      try { db.newQuery(`UPDATE bank_movements SET tx_line_id = '' WHERE tx_line_id IN (${txLineSubquery})`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE invoices SET tx_id = '', tx_number = '' WHERE tx_id IN (${txSubquery})`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE purchase_invoices SET tx_id = '' WHERE tx_id IN (${txSubquery})`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE inventory_movements SET tx_id = '' WHERE tx_id IN (${txSubquery})`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE ph_invoices SET tx_id = '' WHERE tx_id IN (${txSubquery})`).execute(); } catch(_) {}
      try { db.newQuery(`UPDATE inmo_invoices SET tx_id = '' WHERE tx_id IN (${txSubquery})`).execute(); } catch(_) {}
      
      // Si se seleccionó reset_payroll o si se están borrando comprobantes de nómina
      if (selections.reset_payroll || selections.payroll) {
        try { db.newQuery(`UPDATE payroll_periods SET tx_id = '', status = 'draft' WHERE date_from >= '${s}' AND date_to <= '${en}'`).execute(); } catch(_) {}
      } else {
        try { db.newQuery(`UPDATE payroll_periods SET tx_id = '' WHERE date_from >= '${s}' AND date_to <= '${en}'`).execute(); } catch(_) {}
      }
    }
  } catch (fkErr) {
    console.error("[Clear Period FK Error]", fkErr);
    return e.json(500, { message: "Error al romper referencias: " + fkErr.message });
  }

  // ── FASE 2: Borrar registros dentro de la transacción de PocketBase ───────
  try {
    $app.runInTransaction((txApp) => {

      // Nómina
      if (selections.payroll) {
        affectedModules.push("Nómina");
        let periods = [];
        try { periods = txApp.findRecordsByFilter("payroll_periods", "date_from >= '" + startDate + "' && date_to <= '" + endDate + "'", "", 10000); } catch(_) {}
        for (let i = 0; i < periods.length; i++) { txApp.delete(periods[i]); clearedCount++; }
      }

      // Restablecimiento explícito de períodos de nómina a Borrador
      if (selections.reset_payroll && !selections.payroll) {
        affectedModules.push("Restablecimiento de Nómina (a Borrador)");
        let periods = [];
        try { periods = txApp.findRecordsByFilter("payroll_periods", "date_from >= '" + startDate + "' && date_to <= '" + endDate + "'", "", 10000); } catch(_) {}
        for (let i = 0; i < periods.length; i++) {
          const p = periods[i];
          p.set("status", "draft");
          p.set("tx_id", "");
          txApp.save(p);

          if (selections.clear_payroll_lines) {
            let pLines = [];
            try { pLines = txApp.findRecordsByFilter("payroll_lines", "period_id = '" + p.id + "'", "", 10000); } catch(_) {}
            for (let k = 0; k < pLines.length; k++) {
              txApp.delete(pLines[k]);
              clearedCount++;
            }
          }
        }
      }

      // Movimientos Bancarios
      if (selections.bank_movements) {
        affectedModules.push("Movimientos bancarios");
        let bms = [];
        try { bms = txApp.findRecordsByFilter("bank_movements", "date >= '" + startDate + "' && date <= '" + endDate + "'", "", 50000); } catch(_) {}
        for (let i = 0; i < bms.length; i++) { txApp.delete(bms[i]); clearedCount++; }
      }

      // Movimientos de Inventario
      if (selections.inventory_movements) {
        affectedModules.push("Movimientos de inventario");
        let movements = [];
        try { movements = txApp.findRecordsByFilter("inventory_movements", "date >= '" + startDate + "' && date <= '" + endDate + "'", "", 50000); } catch(_) {}
        for (let i = 0; i < movements.length; i++) { txApp.delete(movements[i]); clearedCount++; }
      }

      // Facturas de Compra
      if (selections.purchase_invoices) {
        affectedModules.push("Facturas de compra");
        let pinvs = [];
        try { pinvs = txApp.findRecordsByFilter("purchase_invoices", "date >= '" + startDate + "' && date <= '" + endDate + "'", "", 50000); } catch(_) {}
        for (let i = 0; i < pinvs.length; i++) { txApp.delete(pinvs[i]); clearedCount++; }
      }

      // Facturas de Venta y POS
      if (selections.invoices) {
        affectedModules.push("Facturas de venta / POS");
        let invs = [];
        try { invs = txApp.findRecordsByFilter("invoices", "date >= '" + startDate + "' && date <= '" + endDate + "'", "", 50000); } catch(_) {}
        for (let i = 0; i < invs.length; i++) { txApp.delete(invs[i]); clearedCount++; }

        let shifts = [];
        try { shifts = txApp.findRecordsByFilter("pos_shifts", "opened_at >= '" + startDate + " 00:00:00' && opened_at <= '" + endDate + " 23:59:59'", "", 50000); } catch(_) {}
        for (let i = 0; i < shifts.length; i++) { txApp.delete(shifts[i]); clearedCount++; }
      }

      // Comprobantes Contables
      if (selections.transactions) {
        const txTypeIds = Array.isArray(selections.tx_type_ids) ? selections.tx_type_ids.filter(Boolean) : [];
        affectedModules.push(txTypeIds.length > 0 ? "Comprobantes contables (filtrados por tipo)" : "Comprobantes contables");

        let filter = "date >= '" + startDate + "' && date <= '" + endDate + "'";
        if (txTypeIds.length > 0) {
          const typeConds = txTypeIds.map(id => "tx_type_id = '" + id + "'").join(" || ");
          filter += " && (" + typeConds + ")";
        }

        let txs = [];
        try {
          txs = txApp.findRecordsByFilter("transactions", filter, "", 50000);
        } catch(_) {}

        if (txs.length > 0) {
          // einvoice_docs.tx_id es required → hay que borrarlos antes de borrar el transaction
          for (let i = 0; i < txs.length; i++) {
            const txId = txs[i].id;
            let eDocs = [];
            try { eDocs = txApp.findRecordsByFilter("einvoice_docs", "tx_id = '" + txId + "'", "", 100); } catch(_) {}
            for (let k = 0; k < eDocs.length; k++) { txApp.delete(eDocs[k]); clearedCount++; }
          }
          // Ahora borrar las transacciones (tx_lines en cascada automática)
          for (let i = 0; i < txs.length; i++) { txApp.delete(txs[i]); clearedCount++; }
        }
      }

      // POST-PROCESAMIENTO
      if (selections.inventory_movements || selections.invoices || selections.purchase_invoices) {
        _cpRecalculateAllStock(txApp);
      }
      _cpRecalculateConsecutives(txApp, selections);
    });

    // Registrar auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action:   "PERIOD_CLEARED",
        entity:   "sistema",
        entity_id: "",
        details:  "Limpieza por período (" + startDate + " a " + endDate + ") completada. " +
                  clearedCount + " registros eliminados. Módulos: " + affectedModules.join(", "),
        user_id:  authRecord.id,
        username: authRecord.getString("email") || authRecord.getString("username") || "system"
      });
      $app.save(auditRec);
    } catch (auditErr) {
      console.warn("[Clear Period Audit Error]", auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Limpieza del período completada correctamente",
      cleared: clearedCount,
      modules: affectedModules
    });

  } catch (err) {
    console.error("[Clear Period Exception]", err);
    return e.json(500, {
      success: false,
      message: "Fallo durante la limpieza del período: " + err.message
    });
  }
});
