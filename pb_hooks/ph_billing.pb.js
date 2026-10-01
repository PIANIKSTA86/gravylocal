/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — ph_billing.pb.js
 * Motor Nativo Backend de Alto Rendimiento para Facturación y Contabilización de Propiedad Horizontal.
 *
 * Endpoints:
 * - POST /api/ph/generate-period  -> Genera facturas borrador del período en bloque (atómico y en memoria)
 * - POST /api/ph/post-period      -> Contabiliza masivamente el período generando comprobantes contables CF
 * - POST /api/ph/unpost-period    -> Descontabiliza el período y revierte asientos contables
 * - POST /api/ph/delete-period    -> Elimina facturas y asientos del período de forma atómica
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERACIÓN MASIVA DE FACTURAS DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("POST", "/api/ph/generate-period", (e) => {
  try {
    function getAuth(evt) {
      var authRecord = null;
      try { if (evt && evt.auth) authRecord = evt.auth; } catch (_) {}
      if (!authRecord) {
        try {
          if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
            var info = $apis.requestInfo(evt);
            authRecord = info ? (info.authRecord || info.auth) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) {
        try {
          if (evt && typeof evt.requestInfo === "function") {
            var info2 = evt.requestInfo();
            authRecord = info2 ? (info2.auth || info2.authRecord) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) return { ok: false, status: 401, error: "No autenticado. Debes iniciar sesión." };

      var role = "superadmin";
      try {
        var colName = "";
        if (typeof authRecord.collectionName === "string") colName = authRecord.collectionName;
        else if (authRecord.collection && typeof authRecord.collection.name === "string") colName = authRecord.collection.name;
        else if (typeof authRecord.collection === "function") {
          var col = authRecord.collection();
          colName = col ? (col.name || "") : "";
        }
        if (colName === "_superusers" || colName === "_admins") {
          role = "superadmin";
        } else {
          role = String(authRecord.getString("role") || "").toLowerCase().trim();
        }
      } catch (_) { role = "superadmin"; }
      if (!role) role = "superadmin";

      var ALLOWED_ROLES = ["superadmin", "administrador", "admin", "contador", "auxiliar"];
      if (ALLOWED_ROLES.indexOf(role) === -1) {
        return { ok: false, status: 403, error: "No tienes permisos contables para operar la facturación PH." };
      }
      return { ok: true, authRecord: authRecord, role: role };
    }

    function getBody(evt) {
      var body = {};
      try { body = evt.requestInfo().body || {}; } catch (_) {
        try { body = (typeof $apis !== "undefined" ? $apis.requestInfo(evt).body : {}) || {}; } catch (_2) {}
      }
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (_) {}
      }
      if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
        try {
          var q = evt.requestInfo().query || {};
          if (q && q.period) body = q;
        } catch (_) {}
      }
      return body || {};
    }

    function getSetting(key, fallback) {
      try {
        var rec = $app.findFirstRecordByFilter("settings", "key = '" + String(key).replace(/'/g, "''") + "'");
        return rec ? (rec.getString("value") || fallback) : fallback;
      } catch (_) {
        return fallback;
      }
    }

    const auth = getAuth(e);
    if (!auth.ok) return e.json(auth.status, { message: auth.error });

    const body = getBody(e);
    const period = String(body.period || "").trim();
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return e.json(400, { message: "El período debe tener formato YYYY-MM (ej. 2026-10)." });
    }

    const parts = period.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    const dueDate = String(body.dueDate || `${nextMonth}-10`).trim();
    const dateStr = `${period}-01`;
    const asOfStr = `${period}-01`;
    const asOfDate = new Date(`${asOfStr}T00:00:00`);

    // 1. Cargar configuración contable PH y nota al pie
    let phCfg = {};
    try {
      const rawCfg = getSetting("ph_config_v1", "{}");
      phCfg = JSON.parse(rawCfg);
    } catch (_) { phCfg = {}; }
    const rawFooterNote = getSetting("ph_invoice_footer_note", "");
    const invoiceFooterNotes = String(phCfg.invoice_footer_note || rawFooterNote || "").trim();

    const lateFeeRate = Number(phCfg.late_fee_rate || 0);
    const incomeCode = String(phCfg.income_code || "413505").trim();
    const lateFeeIncomeCode = String(phCfg.late_fee_income_code || incomeCode).trim();
    const lateConceptIds = Array.isArray(phCfg.late_fee_concepts) ? phCfg.late_fee_concepts.map(String).filter(Boolean) : [];
    const lateConceptSet = new Set(lateConceptIds);

    // 2. Cargar unidades habitacionales activas
    const allProperties = $app.findRecordsByFilter("ph_properties", "active = true", "code", 2000, 0) || [];
    if (!allProperties.length) {
      return e.json(400, { message: "No hay unidades activas registradas en la copropiedad." });
    }

    // 3. Cargar conceptos de facturación activos
    const allConcepts = $app.findRecordsByFilter("ph_billing_concepts", "active = true", "code", 500, 0) || [];
    if (!allConcepts.length) {
      return e.json(400, { message: "No hay conceptos de facturación activos configurados." });
    }

    // Asegurar concepto MORA si se cobra mora
    let moraConceptId = "";
    for (const c of allConcepts) {
      if (String(c.getString("code") || "").trim().toUpperCase() === "MORA") {
        moraConceptId = c.id;
        break;
      }
    }
    if (!moraConceptId && lateFeeRate > 0) {
      try {
        const existingMora = $app.findRecordsByFilter("ph_billing_concepts", "code = 'MORA'", "", 1, 0);
        if (existingMora && existingMora.length > 0) {
          moraConceptId = existingMora[0].id;
        } else {
          const colConcept = $app.findCollectionByNameOrId("ph_billing_concepts");
          const mRec = new Record(colConcept);
          mRec.set("code", "MORA");
          mRec.set("name", "INTERESES DE MORA");
          mRec.set("description", "Intereses de mora por pagos de administración vencidos");
          mRec.set("amount", 0);
          mRec.set("is_variable", true);
          mRec.set("applies_coef", false);
          mRec.set("active", true);
          $app.save(mRec);
          moraConceptId = mRec.id;
        }
      } catch (errMora) {
        console.warn("[ph_billing] No se pudo asegurar concepto MORA:", errMora);
      }
    }

    // 4. Identificar unidades que ya tienen factura para este período (excluir anuladas)
    const existingInvoices = $app.findRecordsByFilter("ph_invoices", "period = '" + period + "' && status != 'voided'", "", 2000, 0) || [];
    const alreadyInvoicedPropIds = new Set();
    for (const inv of existingInvoices) {
      alreadyInvoicedPropIds.add(inv.getString("property_id"));
    }

    const toCreate = allProperties.filter(p => !alreadyInvoicedPropIds.has(p.id));
    if (!toCreate.length) {
      return e.json(200, {
        success: true,
        count: 0,
        period: period,
        message: `Todas las unidades (${allProperties.length}) ya tienen factura para el período ${period}.`
      });
    }

    // 5. Consecutivo numérico de período (CF-YYYYMM-XXXXXX)
    const periodCode = period.replace("-", "");
    const prefix = `CF-${periodCode}-`;
    const numRows = arrayOf(new DynamicModel({ number: "" }));
    $app.db().newQuery("SELECT number FROM ph_invoices WHERE number LIKE {:prefix}")
      .bind({ prefix: prefix + "%" })
      .all(numRows);

    let maxSeq = 0;
    const existingNumberSet = new Set();
    for (const nr of numRows) {
      const numStr = String(nr.number || "");
      existingNumberSet.add(numStr);
      if (numStr.startsWith(prefix)) {
        const parsed = parseInt(numStr.slice(prefix.length), 10);
        if (!isNaN(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }

    // 6. Pre-cargar cartera contable de períodos anteriores para liquidación de mora
    const overdueInvoicesByPropId = {};
    const paidByInvoiceNumber = {};
    const netDebtByOwnerId = {};
    const anticiposByOwnerId = {};
    const linesByOverdueInvoiceId = {};

    if (lateFeeRate > 0 && lateConceptSet.size > 0) {
      try {
        const oldInvs = $app.findRecordsByFilter(
          "ph_invoices",
          "period < '" + period + "' && status != 'paid' && status != 'voided'",
          "period",
          5000,
          0
        ) || [];

        const oldInvIds = [];
        for (const oi of oldInvs) {
          const pid = oi.getString("property_id");
          if (!overdueInvoicesByPropId[pid]) overdueInvoicesByPropId[pid] = [];
          overdueInvoicesByPropId[pid].push(oi);
          oldInvIds.push("'" + oi.id + "'");
        }

        const paidRows = arrayOf(new DynamicModel({ cross_doc_ref: "", total_paid: -0 }));
        $app.db().newQuery(
          "SELECT tl.cross_doc_ref, COALESCE(SUM(tl.credit), 0) AS total_paid " +
          "FROM tx_lines tl " +
          "JOIN transactions t ON t.id = tl.tx_id " +
          "JOIN accounts a ON a.id = tl.account_id " +
          "WHERE t.status = 'active' AND a.code LIKE '13%' AND tl.credit > 0 " +
          "GROUP BY tl.cross_doc_ref"
        ).all(paidRows);

        for (const pr of paidRows) {
          const ref = String(pr.cross_doc_ref || "").trim();
          if (ref) {
            const baseRef = ref.split("-").slice(0, 3).join("-");
            const amt = Number(pr.total_paid || 0);
            paidByInvoiceNumber[ref] = (paidByInvoiceNumber[ref] || 0) + amt;
            if (baseRef !== ref) {
              paidByInvoiceNumber[baseRef] = (paidByInvoiceNumber[baseRef] || 0) + amt;
            }
          }
        }

        const balanceRows = arrayOf(new DynamicModel({ third_party_id: "", net_13: -0, net_28: -0 }));
        $app.db().newQuery(
          "SELECT t.third_party_id, " +
          "SUM(CASE WHEN a.code LIKE '13%' THEN (tl.debit - tl.credit) ELSE 0 END) AS net_13, " +
          "SUM(CASE WHEN a.code LIKE '28%' THEN (tl.credit - tl.debit) ELSE 0 END) AS net_28 " +
          "FROM tx_lines tl " +
          "JOIN transactions t ON t.id = tl.tx_id " +
          "JOIN accounts a ON a.id = tl.account_id " +
          "WHERE t.status = 'active' AND t.date < '" + asOfStr + "' " +
          "GROUP BY t.third_party_id"
        ).all(balanceRows);

        for (const br of balanceRows) {
          const tid = String(br.third_party_id || "").trim();
          if (tid) {
            netDebtByOwnerId[tid] = Math.max(0, Number(br.net_13 || 0) - Number(br.net_28 || 0));
            anticiposByOwnerId[tid] = Math.max(0, Number(br.net_28 || 0) - Number(br.net_13 || 0));
          }
        }

        if (oldInvIds.length > 0) {
          const oldLinesRows = arrayOf(new DynamicModel({ invoice_id: "", concept_id: "", description: "", amount: -0 }));
          $app.db().newQuery(
            "SELECT invoice_id, concept_id, description, amount " +
            "FROM ph_invoice_lines " +
            "WHERE invoice_id IN (" + oldInvIds.join(",") + ")"
          ).all(oldLinesRows);

          for (const olr of oldLinesRows) {
            const iid = olr.invoice_id;
            if (!linesByOverdueInvoiceId[iid]) linesByOverdueInvoiceId[iid] = [];
            linesByOverdueInvoiceId[iid].push(olr);
          }
        }
      } catch (errOverdue) {
        console.warn("[ph_billing] Aviso pre-cargando mora:", errOverdue);
      }
    }

    // 7. Generación atómica dentro de transacción SQLite en el servidor
    let createdCount = 0;
    const invCollection = $app.findCollectionByNameOrId("ph_invoices");
    const linesCollection = $app.findCollectionByNameOrId("ph_invoice_lines");

    $app.runInTransaction((txApp) => {
      for (const prop of toCreate) {
        // Validación de Entrega Material (delivery_date)
        const rawDelivery = String(prop.getString("delivery_date") || "").trim().slice(0, 10);
        let isDeliveryMonth = false;
        let billableDays = 0;
        let totalDaysInMonth = 30;
        let deliveryProportion = 1;

        if (rawDelivery && /^\d{4}-\d{2}-\d{2}$/.test(rawDelivery)) {
          const deliveryPeriod = rawDelivery.slice(0, 7);
          if (period < deliveryPeriod) {
            continue; // No se causa antes de la entrega material
          }
          if (period === deliveryPeriod) {
            isDeliveryMonth = true;
            const [dYear, dMonth, dDay] = rawDelivery.split("-").map(Number);
            totalDaysInMonth = new Date(dYear, dMonth, 0).getDate();
            billableDays = dDay <= 1 ? totalDaysInMonth : Math.max(1, totalDaysInMonth - dDay);
            deliveryProportion = Math.min(1, Math.max(0.01, billableDays / totalDaysInMonth));
          }
        }

        // Calcular líneas de conceptos para la unidad
        const linesToCreate = [];
        let invoiceTotal = 0;
        let lineOrder = 1;
        const coef = Number(prop.getFloat("coef_participacion") || 0);
        const adminFee = Number(prop.getFloat("admin_fee") || 0);

        for (const concept of allConcepts) {
          let amount = Number(concept.getFloat("amount") || 0);
          const cCode = String(concept.getString("code") || "").trim().toUpperCase();
          const cName = String(concept.getString("name") || "").trim();
          const isAdm = cCode === "ADM" || cName.toUpperCase().includes("ADMINISTRA");

          if (isAdm && adminFee > 0) {
            amount = adminFee;
          } else if (concept.getBool("applies_coef") && coef > 0) {
            amount = amount * (coef / 100);
          }

          let desc = cName;
          if (isDeliveryMonth && (isAdm || (!concept.getBool("is_variable") && cCode !== "MORA"))) {
            amount = amount * deliveryProportion;
            desc = `${cName} (Proporcional ${billableDays}/${totalDaysInMonth} días - Entrega: ${rawDelivery})`;
          }

          if (amount <= 0) continue;
          const roundedAmount = Math.round(amount);
          invoiceTotal += roundedAmount;
          linesToCreate.push({
            concept_id: concept.id,
            description: desc,
            amount: roundedAmount,
            line_order: lineOrder++
          });
        }

        // Cálculo de intereses de mora si aplica
        if (lateFeeRate > 0 && lateConceptSet.size > 0) {
          const ownerId = prop.getString("owner_id");
          const netDebt = ownerId ? (netDebtByOwnerId[ownerId] ?? 999999) : 999999;
          let anticipoDisp = ownerId ? (anticiposByOwnerId[ownerId] || 0) : 0;
          const overdueInvs = overdueInvoicesByPropId[prop.id] || [];

          if (netDebt >= 0.01 && overdueInvs.length > 0) {
            let totalLate = 0;
            for (const oldInv of overdueInvs) {
              try {
                const oldDueStr = oldInv ? (oldInv.getString ? oldInv.getString("due_date") : (oldInv.get ? oldInv.get("due_date") : oldInv.due_date)) : "";
                if (!oldDueStr) continue;
                const dueTime = new Date(`${oldDueStr}T00:00:00`).getTime();
                if (isNaN(dueTime) || dueTime >= asOfDate.getTime()) continue;

                const invNumber = String(oldInv ? (oldInv.getString ? oldInv.getString("number") : (oldInv.get ? oldInv.get("number") : oldInv.number)) : "");
                const invTot = Number(oldInv ? (oldInv.getFloat ? oldInv.getFloat("total") : (oldInv.get ? oldInv.get("total") : oldInv.total)) : 0);
                const paidAmt = paidByInvoiceNumber[invNumber] || 0;
                const pendingBal = Math.max(0, invTot - paidAmt);

                if (pendingBal < 0.01) continue; // Pagada contablemente

                if (anticipoDisp >= pendingBal - 0.01) {
                  anticipoDisp -= pendingBal;
                  continue; // Cubierta con anticipos de cuenta 28
                }

                const propFactor = (invTot > 0.01 && pendingBal < invTot) ? (pendingBal / invTot) : 1;
                const oldLines = linesByOverdueInvoiceId[oldInv.id] || [];

                for (const oln of oldLines) {
                  const cid = String(oln.concept_id || "");
                  if (cid && lateConceptSet.has(cid)) {
                    const fullPrinc = Number(oln.amount || 0);
                    const unpaidPrinc = fullPrinc * propFactor;
                    if (unpaidPrinc >= 0.01) {
                      totalLate += unpaidPrinc * (lateFeeRate / 100);
                    }
                  }
                }
              } catch (errOldInv) {
                console.error("[ph_billing] Error procesando factura en mora:", errOldInv, errOldInv.stack);
              }
            }

            if (totalLate > 0) {
              const roundedLate = Math.round(totalLate);
              invoiceTotal += roundedLate;
              linesToCreate.push({
                concept_id: moraConceptId || undefined,
                description: `Interés de mora a ${asOfStr}`,
                amount: roundedLate,
                line_order: lineOrder++
              });
            }
          }
        }

        if (!linesToCreate.length) continue;

        // Generar número consecutivo seguro
        maxSeq++;
        let seq = String(maxSeq).padStart(6, "0");
        let invoiceNumber = `${prefix}${seq}`;
        while (existingNumberSet.has(invoiceNumber)) {
          maxSeq++;
          seq = String(maxSeq).padStart(6, "0");
          invoiceNumber = `${prefix}${seq}`;
        }
        existingNumberSet.add(invoiceNumber);

        // Guardar factura (ph_invoices)
        const invRec = new Record(invCollection);
        invRec.set("number", invoiceNumber);
        invRec.set("period", period);
        invRec.set("property_id", prop.id);
        invRec.set("date", dateStr);
        invRec.set("due_date", dueDate);
        invRec.set("subtotal", invoiceTotal);
        invRec.set("total", invoiceTotal);
        invRec.set("status", "draft");
        invRec.set("notes", invoiceFooterNotes);
        txApp.save(invRec);

        // Guardar líneas de factura (ph_invoice_lines)
        for (const ln of linesToCreate) {
          const lnRec = new Record(linesCollection);
          lnRec.set("invoice_id", invRec.id);
          if (ln.concept_id) lnRec.set("concept_id", ln.concept_id);
          lnRec.set("description", ln.description);
          lnRec.set("amount", ln.amount);
          lnRec.set("line_order", ln.line_order);
          txApp.save(lnRec);
        }

        createdCount++;
      }
    });

    // Auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const aRec = new Record(auditCol);
      aRec.set("username", auth.authRecord.getString("name") || auth.authRecord.getString("email") || "Admin");
      aRec.set("action", "GENERATE_PERIOD");
      aRec.set("entity", "PhInvoices");
      aRec.set("entity_id", period);
      aRec.set("event_at", new Date().toISOString());
      aRec.set("details", `Generación atómica en backend: ${createdCount} facturas creadas para período ${period}`);
      $app.save(aRec);
    } catch (_) {}

    return e.json(200, {
      success: true,
      count: createdCount,
      period: period,
      message: `Generación completada con éxito: ${createdCount} facturas generadas para ${period}.`
    });

  } catch (err) {
    console.error("[ph_billing] Error en /api/ph/generate-period:", err, err.stack);
    return e.json(500, { message: "Error al generar facturas del período: " + (err.message || err), stack: String(err.stack || "") });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTABILIZACIÓN MASIVA DE FACTURAS DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("POST", "/api/ph/post-period", (e) => {
  try {
    function getAuth(evt) {
      var authRecord = null;
      try { if (evt && evt.auth) authRecord = evt.auth; } catch (_) {}
      if (!authRecord) {
        try {
          if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
            var info = $apis.requestInfo(evt);
            authRecord = info ? (info.authRecord || info.auth) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) {
        try {
          if (evt && typeof evt.requestInfo === "function") {
            var info2 = evt.requestInfo();
            authRecord = info2 ? (info2.auth || info2.authRecord) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) return { ok: false, status: 401, error: "No autenticado. Debes iniciar sesión." };

      var role = "superadmin";
      try {
        var colName = "";
        if (typeof authRecord.collectionName === "string") colName = authRecord.collectionName;
        else if (authRecord.collection && typeof authRecord.collection.name === "string") colName = authRecord.collection.name;
        else if (typeof authRecord.collection === "function") {
          var col = authRecord.collection();
          colName = col ? (col.name || "") : "";
        }
        if (colName === "_superusers" || colName === "_admins") {
          role = "superadmin";
        } else {
          role = String(authRecord.getString("role") || "").toLowerCase().trim();
        }
      } catch (_) { role = "superadmin"; }
      if (!role) role = "superadmin";

      var ALLOWED_ROLES = ["superadmin", "administrador", "admin", "contador", "auxiliar"];
      if (ALLOWED_ROLES.indexOf(role) === -1) {
        return { ok: false, status: 403, error: "No tienes permisos contables para operar la facturación PH." };
      }
      return { ok: true, authRecord: authRecord, role: role };
    }

    function getBody(evt) {
      var body = {};
      try { body = evt.requestInfo().body || {}; } catch (_) {
        try { body = (typeof $apis !== "undefined" ? $apis.requestInfo(evt).body : {}) || {}; } catch (_2) {}
      }
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (_) {}
      }
      if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
        try {
          var q = evt.requestInfo().query || {};
          if (q && q.period) body = q;
        } catch (_) {}
      }
      return body || {};
    }

    function getSetting(key, fallback) {
      try {
        var rec = $app.findFirstRecordByFilter("settings", "key = '" + String(key).replace(/'/g, "''") + "'");
        return rec ? (rec.getString("value") || fallback) : fallback;
      } catch (_) {
        return fallback;
      }
    }

    const auth = getAuth(e);
    if (!auth.ok) return e.json(auth.status, { message: auth.error });

    const body = getBody(e);
    const period = String(body.period || "").trim();
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return e.json(400, { message: "El período debe tener formato YYYY-MM." });
    }

    const draftInvoices = $app.findRecordsByFilter(
      "ph_invoices",
      "period = '" + period + "' && status = 'draft'",
      "number",
      5000,
      0
    ) || [];

    if (!draftInvoices.length) {
      return e.json(200, {
        success: true,
        period: period,
        total: 0,
        posted: 0,
        skipped: 0,
        failed: 0,
        message: `No hay facturas en borrador para contabilizar en el período ${period}.`
      });
    }

    // 1. Cargar tipo de transacción CF
    const cfTypes = $app.findRecordsByFilter("transaction_types", "code = 'CF' && active = true", "", 1, 0);
    if (!cfTypes || !cfTypes.length) {
      return e.json(400, { message: "Tipo de transacción 'CF' no encontrado. Verifica la configuración contable." });
    }
    const cfType = cfTypes[0];

    // 2. Cargar configuración contable PH
    let phCfg = {};
    try {
      const rawCfg = getSetting("ph_config_v1", "{}");
      phCfg = JSON.parse(rawCfg);
    } catch (_) { phCfg = {}; }

    const cxcCode = String(phCfg.cxc_code || "130505").trim();
    const incomeCode = String(phCfg.income_code || "413505").trim();
    const lateFeeIncomeCode = String(phCfg.late_fee_income_code || incomeCode).trim();

    // 3. Cachear cuentas contables en memoria
    const accountByCode = {};
    function getAcc(code) {
      if (!code) return null;
      if (accountByCode[code]) return accountByCode[code];
      try {
        const found = $app.findFirstRecordByFilter("accounts", "code = '" + String(code).replace(/'/g, "''") + "'");
        if (found) {
          accountByCode[code] = found;
          return found;
        }
      } catch (_) {}
      return null;
    }

    const cxcAcc = getAcc(cxcCode);
    if (!cxcAcc) {
      return e.json(400, { message: `Cuenta de cartera (CxC) ${cxcCode} no existe en el plan de cuentas.` });
    }
    const defaultIncomeAcc = getAcc(incomeCode);
    const lateFeeIncomeAcc = getAcc(lateFeeIncomeCode) || defaultIncomeAcc;

    // 4. Cachear conceptos de facturación para resolución de cuentas de ingreso
    const conceptRecords = $app.findRecordsByFilter("ph_billing_concepts", "", "", 500, 0) || [];
    const conceptAccIdMap = {};
    for (const cr of conceptRecords) {
      const accId = cr.getString("account_id");
      if (accId) conceptAccIdMap[cr.id] = accId;
    }

    // 5. Pre-cargar inmuebles y sus propietarios
    const propIds = [];
    for (const inv of draftInvoices) {
      const pid = inv.getString("property_id");
      if (pid) propIds.push("'" + pid + "'");
    }

    const propMap = {};
    if (propIds.length > 0) {
      const propRows = arrayOf(new DynamicModel({ id: "", code: "", name: "", owner_id: "" }));
      $app.db().newQuery(
        "SELECT id, code, name, owner_id FROM ph_properties WHERE id IN (" + propIds.join(",") + ")"
      ).all(propRows);
      for (const p of propRows) {
        propMap[p.id] = {
          code: p.code,
          name: p.name,
          owner_id: p.owner_id
        };
      }
    }

    // 6. Pre-cargar líneas de facturas en 1 solo query agrupado
    const invoiceIds = draftInvoices.map(i => "'" + i.id + "'");
    const allLinesRows = arrayOf(new DynamicModel({ invoice_id: "", concept_id: "", description: "", amount: -0 }));
    $app.db().newQuery(
      "SELECT invoice_id, concept_id, description, amount " +
      "FROM ph_invoice_lines " +
      "WHERE invoice_id IN (" + invoiceIds.join(",") + ") " +
      "ORDER BY line_order ASC"
    ).all(allLinesRows);

    const linesByInvId = {};
    for (const row of allLinesRows) {
      const iid = row.invoice_id;
      if (!linesByInvId[iid]) linesByInvId[iid] = [];
      linesByInvId[iid].push(row);
    }

    // 7. Contabilización atómica por lote
    let postedCount = 0;
    let failedCount = 0;
    const errors = [];
    const txCollection = $app.findCollectionByNameOrId("transactions");
    const txLinesCollection = $app.findCollectionByNameOrId("tx_lines");

    $app.runInTransaction((txApp) => {
      for (const inv of draftInvoices) {
        const invTotal = Number(inv.getFloat("total") || 0);
        const invLines = linesByInvId[inv.id] || [];
        const propInfo = propMap[inv.getString("property_id")] || {};
        const ownerId = propInfo.owner_id || "";
        const invDate = inv.getString("date") || `${period}-01`;
        const invNumber = inv.getString("number");

        if (invTotal <= 0 || !invLines.length) {
          failedCount++;
          errors.push(`Factura ${invNumber}: total inválido ($${invTotal}) o sin líneas.`);
          continue;
        }

        // Crear Comprobante Contable CF
        const txRec = new Record(txCollection);
        txRec.set("tx_type_id", cfType.id);
        txRec.set("number", invNumber);
        txRec.set("date", invDate);
        txRec.set("description", `Causación cuota de administración ${period} - Unidad ${propInfo.code || ""} (${propInfo.name || ""})`);
        txRec.set("third_party_id", ownerId);
        txRec.set("status", "active");
        txApp.save(txRec);

        // Línea Débito a Cartera (CxC 13)
        const debitLine = new Record(txLinesCollection);
        debitLine.set("tx_id", txRec.id);
        debitLine.set("account_id", cxcAcc.id);
        debitLine.set("third_party_id", ownerId);
        debitLine.set("description", `Factura ${invNumber} - ${period} - Unidad ${propInfo.code || ""}`);
        debitLine.set("debit", invTotal);
        debitLine.set("credit", 0);
        debitLine.set("cross_doc_ref", invNumber);
        txApp.save(debitLine);

        // Líneas Crédito por Concepto (Ingreso 4)
        for (const ln of invLines) {
          const lnAmt = Number(ln.amount || 0);
          if (lnAmt <= 0) continue;

          let targetAccId = "";
          if (ln.concept_id && conceptAccIdMap[ln.concept_id]) {
            targetAccId = conceptAccIdMap[ln.concept_id];
          }
          if (!targetAccId) {
            const isMora = String(ln.description || "").toLowerCase().includes("mora");
            targetAccId = isMora && lateFeeIncomeAcc ? lateFeeIncomeAcc.id : (defaultIncomeAcc ? defaultIncomeAcc.id : cxcAcc.id);
          }

          const creditLine = new Record(txLinesCollection);
          creditLine.set("tx_id", txRec.id);
          creditLine.set("account_id", targetAccId);
          creditLine.set("third_party_id", ownerId);
          creditLine.set("description", `${ln.description || "Cuota administración"} - Factura ${invNumber}`);
          creditLine.set("debit", 0);
          creditLine.set("credit", lnAmt);
          creditLine.set("cross_doc_ref", invNumber);
          txApp.save(creditLine);
        }

        // Actualizar estado de la factura a 'posted' y vincular tx_id
        inv.set("status", "posted");
        inv.set("tx_id", txRec.id);
        txApp.save(inv);

        postedCount++;
      }
    });

    // Auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const aRec = new Record(auditCol);
      aRec.set("username", auth.authRecord.getString("name") || auth.authRecord.getString("email") || "Admin");
      aRec.set("action", "POST_PERIOD");
      aRec.set("entity", "PhInvoices");
      aRec.set("entity_id", period);
      aRec.set("event_at", new Date().toISOString());
      aRec.set("details", `Contabilización atómica en backend: ${postedCount} facturas contabilizadas para período ${period}`);
      $app.save(aRec);
    } catch (_) {}

    return e.json(200, {
      success: true,
      period: period,
      total: draftInvoices.length,
      posted: postedCount,
      failed: failedCount,
      errors: errors.slice(0, 10),
      message: `Contabilización completada: ${postedCount} facturas contabilizadas con éxito para ${period}.`
    });

  } catch (err) {
    console.error("[ph_billing] Error en /api/ph/post-period:", err);
    return e.json(500, { message: "Error al contabilizar período: " + (err.message || err) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. DESCONTABILIZACIÓN MASIVA DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("POST", "/api/ph/unpost-period", (e) => {
  try {
    function getAuth(evt) {
      var authRecord = null;
      try { if (evt && evt.auth) authRecord = evt.auth; } catch (_) {}
      if (!authRecord) {
        try {
          if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
            var info = $apis.requestInfo(evt);
            authRecord = info ? (info.authRecord || info.auth) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) {
        try {
          if (evt && typeof evt.requestInfo === "function") {
            var info2 = evt.requestInfo();
            authRecord = info2 ? (info2.auth || info2.authRecord) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) return { ok: false, status: 401, error: "No autenticado. Debes iniciar sesión." };

      var role = "superadmin";
      try {
        var colName = "";
        if (typeof authRecord.collectionName === "string") colName = authRecord.collectionName;
        else if (authRecord.collection && typeof authRecord.collection.name === "string") colName = authRecord.collection.name;
        else if (typeof authRecord.collection === "function") {
          var col = authRecord.collection();
          colName = col ? (col.name || "") : "";
        }
        if (colName === "_superusers" || colName === "_admins") {
          role = "superadmin";
        } else {
          role = String(authRecord.getString("role") || "").toLowerCase().trim();
        }
      } catch (_) { role = "superadmin"; }
      if (!role) role = "superadmin";

      var ALLOWED_ROLES = ["superadmin", "administrador", "admin", "contador", "auxiliar"];
      if (ALLOWED_ROLES.indexOf(role) === -1) {
        return { ok: false, status: 403, error: "No tienes permisos contables para operar la facturación PH." };
      }
      return { ok: true, authRecord: authRecord, role: role };
    }

    function getBody(evt) {
      var body = {};
      try { body = evt.requestInfo().body || {}; } catch (_) {
        try { body = (typeof $apis !== "undefined" ? $apis.requestInfo(evt).body : {}) || {}; } catch (_2) {}
      }
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (_) {}
      }
      if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
        try {
          var q = evt.requestInfo().query || {};
          if (q && q.period) body = q;
        } catch (_) {}
      }
      return body || {};
    }

    const auth = getAuth(e);
    if (!auth.ok) return e.json(auth.status, { message: auth.error });

    const body = getBody(e);
    const period = String(body.period || "").trim();
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return e.json(400, { message: "El período debe tener formato YYYY-MM." });
    }

    const invoices = $app.findRecordsByFilter(
      "ph_invoices",
      "period = '" + period + "' && (status = 'posted' || status = 'paid')",
      "",
      5000,
      0
    ) || [];

    if (!invoices.length) {
      return e.json(200, { success: true, period: period, reverted: 0, message: "No hay facturas contabilizadas para descontabilizar." });
    }

    const txIdsToDelete = new Set();
    for (const inv of invoices) {
      const txId = inv.getString("tx_id");
      if (txId) txIdsToDelete.add(txId);
    }

    let revertedCount = 0;
    $app.runInTransaction((txApp) => {
      // 1. Eliminar comprobantes contables asociados
      for (const tid of txIdsToDelete) {
        try {
          const txRec = txApp.findRecordById("transactions", tid);
          if (txRec) txApp.delete(txRec);
        } catch (_) {}
      }

      // 2. Revertir facturas a estado draft y limpiar tx_id
      for (const inv of invoices) {
        inv.set("status", "draft");
        inv.set("tx_id", "");
        txApp.save(inv);
        revertedCount++;
      }
    });

    return e.json(200, {
      success: true,
      period: period,
      reverted: revertedCount,
      message: `Se descontabilizaron ${revertedCount} facturas del período ${period}.`
    });

  } catch (err) {
    console.error("[ph_billing] Error en /api/ph/unpost-period:", err);
    return e.json(500, { message: "Error al descontabilizar período: " + (err.message || err) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ELIMINACIÓN MASIVA DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("POST", "/api/ph/delete-period", (e) => {
  try {
    function getAuth(evt) {
      var authRecord = null;
      try { if (evt && evt.auth) authRecord = evt.auth; } catch (_) {}
      if (!authRecord) {
        try {
          if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
            var info = $apis.requestInfo(evt);
            authRecord = info ? (info.authRecord || info.auth) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) {
        try {
          if (evt && typeof evt.requestInfo === "function") {
            var info2 = evt.requestInfo();
            authRecord = info2 ? (info2.auth || info2.authRecord) : null;
          }
        } catch (_) {}
      }
      if (!authRecord) return { ok: false, status: 401, error: "No autenticado. Debes iniciar sesión." };

      var role = "superadmin";
      try {
        var colName = "";
        if (typeof authRecord.collectionName === "string") colName = authRecord.collectionName;
        else if (authRecord.collection && typeof authRecord.collection.name === "string") colName = authRecord.collection.name;
        else if (typeof authRecord.collection === "function") {
          var col = authRecord.collection();
          colName = col ? (col.name || "") : "";
        }
        if (colName === "_superusers" || colName === "_admins") {
          role = "superadmin";
        } else {
          role = String(authRecord.getString("role") || "").toLowerCase().trim();
        }
      } catch (_) { role = "superadmin"; }
      if (!role) role = "superadmin";

      var ALLOWED_ROLES = ["superadmin", "administrador", "admin", "contador", "auxiliar"];
      if (ALLOWED_ROLES.indexOf(role) === -1) {
        return { ok: false, status: 403, error: "No tienes permisos contables para operar la facturación PH." };
      }
      return { ok: true, authRecord: authRecord, role: role };
    }

    function getBody(evt) {
      var body = {};
      try { body = evt.requestInfo().body || {}; } catch (_) {
        try { body = (typeof $apis !== "undefined" ? $apis.requestInfo(evt).body : {}) || {}; } catch (_2) {}
      }
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (_) {}
      }
      if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
        try {
          var q = evt.requestInfo().query || {};
          if (q && q.period) body = q;
        } catch (_) {}
      }
      return body || {};
    }

    const auth = getAuth(e);
    if (!auth.ok) return e.json(auth.status, { message: auth.error });

    const body = getBody(e);
    const period = String(body.period || "").trim();
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return e.json(400, { message: "El período debe tener formato YYYY-MM." });
    }

    const invoices = $app.findRecordsByFilter(
      "ph_invoices",
      "period = '" + period + "'",
      "",
      5000,
      0
    ) || [];

    if (!invoices.length) {
      return e.json(200, { success: true, period: period, deleted: 0, message: "No hay facturas registradas en este período." });
    }

    const txIdsToDelete = new Set();
    for (const inv of invoices) {
      const txId = inv.getString("tx_id");
      if (txId) txIdsToDelete.add(txId);
    }

    let deletedCount = 0;
    let txDeletedCount = 0;

    $app.runInTransaction((txApp) => {
      // 1. Eliminar transacciones contables
      for (const tid of txIdsToDelete) {
        try {
          const txRec = txApp.findRecordById("transactions", tid);
          if (txRec) {
            txApp.delete(txRec);
            txDeletedCount++;
          }
        } catch (_) {}
      }

      // 2. Eliminar facturas (sus líneas asociadas se eliminan en cascada por PocketBase)
      for (const inv of invoices) {
        txApp.delete(inv);
        deletedCount++;
      }
    });

    return e.json(200, {
      success: true,
      period: period,
      deleted: deletedCount,
      txDeleted: txDeletedCount,
      message: `Se eliminaron ${deletedCount} facturas y ${txDeletedCount} comprobantes contables del período ${period}.`
    });

  } catch (err) {
    console.error("[ph_billing] Error en /api/ph/delete-period:", err);
    return e.json(500, { message: "Error al eliminar período: " + (err.message || err) });
  }
});
