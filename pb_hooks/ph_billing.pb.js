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

// Helper para validar autenticación y roles contables
function checkPhBillingAuth(e) {
  let authRecord = null;
  try {
    authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  } catch (_) {
    try { authRecord = e.requestInfo().auth; } catch (_2) {}
  }

  if (!authRecord) {
    return { ok: false, status: 401, error: "No autenticado. Debes iniciar sesión." };
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
    return { ok: false, status: 403, error: "No tienes permisos contables para operar la facturación PH." };
  }

  return { ok: true, authRecord, role };
}

// Helper para parsear body JSON de la petición
function parsePhRequestBody(e) {
  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = (typeof $apis !== "undefined" ? $apis.requestInfo(e).body : {}) || {};
    } catch (_2) {}
  }
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) {}
  }
  return body || {};
}

// Helper para leer setting
function getPhSetting(app, key, fallback) {
  try {
    const rec = app.findFirstRecordByFilter("settings", "key = '" + String(key).replace(/'/g, "''") + "'");
    return rec ? (rec.getString("value") || fallback) : fallback;
  } catch (_) {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERACIÓN MASIVA DE FACTURAS DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("POST", "/api/ph/generate-period", (e) => {
  const auth = checkPhBillingAuth(e);
  if (!auth.ok) return e.json(auth.status, { message: auth.error });

  const body = parsePhRequestBody(e);
  const period = String(body.period || "").trim();
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return e.json(400, { message: "El período debe tener formato YYYY-MM (ej. 2026-10)." });
  }

  const [y, m] = period.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const dueDate = String(body.dueDate || `${nextMonth}-10`).trim();
  const dateStr = `${period}-01`;
  const asOfStr = `${period}-01`;
  const asOfDate = new Date(`${asOfStr}T00:00:00`);

  try {
    // 1. Cargar configuración contable PH y nota al pie
    let phCfg = {};
    try {
      const rawCfg = getPhSetting($app, "ph_config_v1", "{}");
      phCfg = JSON.parse(rawCfg);
    } catch (_) { phCfg = {}; }
    const rawFooterNote = getPhSetting($app, "ph_invoice_footer_note", "");
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
    const numRows = [];
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
    // En lugar de hacer miles de queries desde cliente, 2 consultas SQL en memoria resuelven toda la copropiedad
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

        // Consultar recaudos contables de facturas en mora de una sola vez
        const paidRows = [];
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
            // Soportar referencia base y con sufijo de concepto (ej: CF-202609-000001 y CF-202609-000001-ADM)
            const baseRef = ref.split("-").slice(0, 3).join("-");
            const amt = Number(pr.total_paid || 0);
            paidByInvoiceNumber[ref] = (paidByInvoiceNumber[ref] || 0) + amt;
            if (baseRef !== ref) {
              paidByInvoiceNumber[baseRef] = (paidByInvoiceNumber[baseRef] || 0) + amt;
            }
          }
        }

        // Consultar deuda contable neta (13) y anticipos (28) antes de este período agrupada por propietario
        const balanceRows = [];
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

        // Pre-cargar líneas de facturas vencidas en 1 solo query si hay facturas en mora
        if (oldInvIds.length > 0) {
          const oldLinesRows = [];
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
              const oldDueStr = oldInv.getString("due_date");
              if (!oldDueStr) continue;
              const dueTime = new Date(`${oldDueStr}T00:00:00`).getTime();
              if (isNaN(dueTime) || dueTime >= asOfDate.getTime()) continue;

              const invNumber = oldInv.getString("number");
              const invTot = Number(oldInv.getFloat("total") || 0);
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
    console.error("[ph_billing] Error en /api/ph/generate-period:", err);
    return e.json(500, { message: "Error al generar facturas del período: " + (err.message || err) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTABILIZACIÓN MASIVA DE FACTURAS DEL PERÍODO
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("POST", "/api/ph/post-period", (e) => {
  const auth = checkPhBillingAuth(e);
  if (!auth.ok) return e.json(auth.status, { message: auth.error });

  const body = parsePhRequestBody(e);
  const period = String(body.period || "").trim();
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return e.json(400, { message: "El período debe tener formato YYYY-MM." });
  }

  try {
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
      const rawCfg = getPhSetting($app, "ph_config_v1", "{}");
      phCfg = JSON.parse(rawCfg);
    } catch (_) { phCfg = {}; }

    const cxcCode = String(phCfg.cxc_code || "130505").trim();
    const incomeCode = String(phCfg.income_code || "413505").trim();
    const lateFeeIncomeCode = String(phCfg.late_fee_income_code || incomeCode).trim();

    // 3. Cachear cuentas contables en memoria
    const accountByCode = {};
    const accountById = {};
    const loadAcc = (code) => {
      const c = String(code || "").trim();
      if (!c || accountByCode[c]) return accountByCode[c];
      try {
        const found = $app.findRecordsByFilter("accounts", "code = '" + c + "'", "", 1, 0);
        if (found && found.length > 0) {
          accountByCode[c] = found[0];
          accountById[found[0].id] = found[0];
          return found[0];
        }
      } catch (_) {}
      return null;
    };

    const cxcAccount = loadAcc(cxcCode);
    const incomeDefaultAccount = loadAcc(incomeCode);
    if (!cxcAccount) throw new Error(`Cuenta CxC "${cxcCode}" no encontrada en el PUC.`);
    if (!incomeDefaultAccount) throw new Error(`Cuenta de ingreso "${incomeCode}" no encontrada en el PUC.`);

    // 4. Pre-cargar propiedades y sus propietarios
    const allProps = $app.findRecordsByFilter("ph_properties", "", "code", 2000, 0) || [];
    const propsMap = {};
    for (const p of allProps) {
      propsMap[p.id] = p;
    }

    // 5. Pre-cargar líneas de todas las facturas borrador en 1 solo query
    const invIds = draftInvoices.map(i => "'" + i.id + "'");
    const rawLines = [];
    $app.db().newQuery(
      "SELECT id, invoice_id, concept_id, description, amount, line_order " +
      "FROM ph_invoice_lines " +
      "WHERE invoice_id IN (" + invIds.join(",") + ") " +
      "ORDER BY line_order ASC"
    ).all(rawLines);

    const linesByInvId = {};
    for (const rl of rawLines) {
      if (!linesByInvId[rl.invoice_id]) linesByInvId[rl.invoice_id] = [];
      linesByInvId[rl.invoice_id].push(rl);
    }

    // 6. Pre-cargar conceptos para mapeo de cuentas contables específicas por concepto
    const allConcepts = $app.findRecordsByFilter("ph_billing_concepts", "", "", 500, 0) || [];
    const conceptMap = {};
    for (const c of allConcepts) {
      conceptMap[c.id] = c;
    }

    const txCollection = $app.findCollectionByNameOrId("transactions");
    const txLinesCollection = $app.findCollectionByNameOrId("tx_lines");
    const userId = auth.authRecord ? auth.authRecord.id : "";

    let postedCount = 0;
    let failedCount = 0;
    const failures = [];

    $app.runInTransaction((txApp) => {
      for (const inv of draftInvoices) {
        const invLines = linesByInvId[inv.id] || [];
        if (!invLines.length) {
          failedCount++;
          failures.push(`${inv.getString("number")}: Factura sin líneas`);
          continue;
        }

        const prop = propsMap[inv.getString("property_id")];
        const ownerId = prop ? (prop.getString("owner_id") || null) : null;
        const propTag = prop ? `[${prop.getString("name") || prop.getString("code")}] ` : "";
        const invNumber = inv.getString("number");

        // Construir líneas contables del comprobante CF
        const accountingLines = [];

        // Créditos (Ingresos por concepto)
        for (const ln of invLines) {
          const concept = ln.concept_id ? conceptMap[ln.concept_id] : null;
          const conceptCode = concept ? (concept.getString("code") || "").trim().toUpperCase() : "GEN";
          const refPorConcepto = `${invNumber}-${conceptCode}`;

          let incAcc = incomeDefaultAccount;
          if (conceptCode === "MORA") {
            const lateAcc = loadAcc(lateFeeIncomeCode);
            if (lateAcc) incAcc = lateAcc;
          } else if (concept && concept.getString("account_id")) {
            const specificAccId = concept.getString("account_id");
            if (accountById[specificAccId]) {
              incAcc = accountById[specificAccId];
            } else {
              try {
                const accRec = txApp.findRecordById("accounts", specificAccId);
                if (accRec) {
                  accountById[specificAccId] = accRec;
                  incAcc = accRec;
                }
              } catch (_) {}
            }
          }

          const rawDesc = String(ln.description || "").trim();
          const finalDesc = rawDesc.startsWith("[") ? rawDesc : `${propTag}${rawDesc}`;

          accountingLines.push({
            account_id: incAcc.id,
            debit: 0,
            credit: Number(ln.amount || 0),
            description: finalDesc,
            third_party_id: ownerId,
            cross_doc_ref: refPorConcepto
          });
        }

        // Débitos (CxC a copropietario por cada concepto)
        for (const ln of invLines) {
          const concept = ln.concept_id ? conceptMap[ln.concept_id] : null;
          const conceptCode = concept ? (concept.getString("code") || "").trim().toUpperCase() : "GEN";
          const refPorConcepto = `${invNumber}-${conceptCode}`;
          const rawDesc = String(ln.description || "").trim();
          const finalDesc = rawDesc.startsWith("[") ? rawDesc : `${propTag}${rawDesc}`;

          accountingLines.unshift({
            account_id: cxcAccount.id,
            debit: Number(ln.amount || 0),
            credit: 0,
            description: finalDesc,
            third_party_id: ownerId,
            cross_doc_ref: refPorConcepto
          });
        }

        // Validación de partida doble
        const sumDeb = accountingLines.reduce((s, l) => s + l.debit, 0);
        const sumCred = accountingLines.reduce((s, l) => s + l.credit, 0);
        if (Math.abs(sumDeb - sumCred) > 1.0) {
          failedCount++;
          failures.push(`${invNumber}: Descuadre contable (D:${sumDeb}, C:${sumCred})`);
          continue;
        }

        // 1. Guardar cabecera de transacción contable CF
        const txRec = new Record(txCollection);
        txRec.set("tx_type_id", cfType.id);
        txRec.set("number", "AUTO");
        txRec.set("date", inv.getString("date"));
        txRec.set("description", `${prop ? prop.getString("name") : "Unidad"} - Factura PH ${invNumber}`);
        txRec.set("status", "active");
        if (ownerId) txRec.set("third_party_id", ownerId);
        if (userId) txRec.set("user_id", userId);
        txRec.set("cross_enabled", true);
        txRec.set("cross_type", "ph_invoices");
        txRec.set("cross_number", invNumber);
        txRec.set("cross_amount", inv.getFloat("total"));
        txRec.set("cross_purpose", "Causar");
        txApp.save(txRec);

        // 2. Guardar líneas contables tx_lines
        let order = 1;
        for (const al of accountingLines) {
          const tlRec = new Record(txLinesCollection);
          tlRec.set("tx_id", txRec.id);
          tlRec.set("account_id", al.account_id);
          tlRec.set("debit", al.debit);
          tlRec.set("credit", al.credit);
          tlRec.set("description", al.description);
          tlRec.set("line_order", order++);
          tlRec.set("cross_doc_ref", al.cross_doc_ref);
          if (al.third_party_id) tlRec.set("third_party_id", al.third_party_id);
          txApp.save(tlRec);
        }

        // 3. Actualizar factura PH a posted
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
      aRec.set("details", `Contabilización masiva backend: ${postedCount} facturas contabilizadas para ${period}`);
      $app.save(aRec);
    } catch (_) {}

    return e.json(200, {
      success: true,
      period: period,
      total: draftInvoices.length,
      posted: postedCount,
      skipped: 0,
      failed: failedCount,
      failures: failures,
      message: `Contabilización completada: ${postedCount} facturas contabilizadas.${failedCount > 0 ? " Fallaron: " + failedCount : ""}`
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
  const auth = checkPhBillingAuth(e);
  if (!auth.ok) return e.json(auth.status, { message: auth.error });

  const body = parsePhRequestBody(e);
  const period = String(body.period || "").trim();
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return e.json(400, { message: "El período debe tener formato YYYY-MM." });
  }

  try {
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
  const auth = checkPhBillingAuth(e);
  if (!auth.ok) return e.json(auth.status, { message: auth.error });

  const body = parsePhRequestBody(e);
  const period = String(body.period || "").trim();
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return e.json(400, { message: "El período debe tener formato YYYY-MM." });
  }

  try {
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
