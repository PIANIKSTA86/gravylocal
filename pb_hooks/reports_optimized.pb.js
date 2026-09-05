/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — reports_optimized.pb.js
 * 
 * Endpoints optimizados para la generación inmediata de reportes contables
 * con filtrado uniforme por Sucursal (branch_id) y Centro de Costo (cost_center_id).
 */

routerAdd("GET", "/api/gravy/report-balances", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let startDate = String(queryParams.startDate || '').trim();
  let endDate = String(queryParams.endDate || '').trim();

  if (!endDate) {
    return c.json(400, { error: "El parámetro endDate es requerido." });
  }

  if (startDate) startDate = startDate.slice(0, 10);
  endDate = endDate.slice(0, 10);

  try {
    let sql = `
      SELECT
        l.account_id AS accountId,
        SUM(l.debit - l.credit) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active'
        AND t.date <= {:endDate}
    `;

    const binds = { endDate };

    if (startDate) {
      sql += " AND t.date >= {:startDate}";
      binds.startDate = startDate;
    }
    if (branchId) {
      sql += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      binds.branchId = branchId;
    }
    if (costCenterId) {
      sql += " AND l.cost_center_id = {:costCenterId}";
      binds.costCenterId = costCenterId;
    }

    sql += " GROUP BY l.account_id";

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    const data = arrayOf(new DynamicModel({ accountId: "", balance: -0 }));
    query.all(data);

    const saldos = {};
    for (const row of data) {
      saldos[row.accountId] = Number(row.balance) || 0;
    }

    return c.json(200, saldos);
  } catch (err) {
    return c.json(500, { error: "Error obteniendo saldos de reporte: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/treasury-metrics", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let mode = String(queryParams.mode || "recaudos").toLowerCase();
  let asOfDate = String(queryParams.asOfDate || "").trim();

  if (!asOfDate) {
    asOfDate = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
  } else {
    asOfDate = asOfDate.slice(0, 10);
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const defaultStart = `${y}-${m}-01`;
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  const defaultEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

  let startDate = String(queryParams.startDate || defaultStart).trim();
  let endDate = String(queryParams.endDate || defaultEnd).trim();

  try {
    const isRecaudo = mode === 'recaudos' || mode === 'cxc' || mode === 'rc';
    const accountPrefixes = isRecaudo ? ['13'] : ['22', '23', '25'];
    const filterClause = accountPrefixes.map(p => `a.code LIKE '${p}%'`).join(' OR ');

    let sqlAging = `
      SELECT
        l.account_id,
        a.code AS account_code,
        a.maneja_cruce AS account_maneja_cruce,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_party_id,
        l.cross_doc_ref,
        l.debit,
        l.credit
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active'
        AND t.date <= {:asOfDateLimit}
        AND (${filterClause})
    `;

    const agingBinds = { asOfDateLimit: asOfDate + " 23:59:59" };
    if (branchId) {
      sqlAging += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      agingBinds.branchId = branchId;
    }
    if (costCenterId) {
      sqlAging += " AND l.cost_center_id = {:costCenterId}";
      agingBinds.costCenterId = costCenterId;
    }

    const agingQuery = $app.db().newQuery(sqlAging);
    agingQuery.bind(agingBinds);

    const agingData = arrayOf(new DynamicModel({
      account_id: "",
      account_code: "",
      account_maneja_cruce: 0,
      third_party_id: "",
      cross_doc_ref: "",
      debit: -0,
      credit: -0
    }));
    agingQuery.all(agingData);

    const docs = {};
    for (const r of agingData) {
      const manejaCruce = r.account_maneja_cruce === 1 || r.account_maneja_cruce === true || r.account_maneja_cruce === "1" || r.account_maneja_cruce === "true";
      const refRaw = String(r.cross_doc_ref || '').trim();
      if (!manejaCruce && !refRaw) continue;

      const ref = refRaw || 'SIN_DOC';
      const key = `${r.account_id}|${r.third_party_id}|${ref}`;
      if (!docs[key]) {
        docs[key] = { debit: 0, credit: 0 };
      }
      docs[key].debit += Number(r.debit || 0);
      docs[key].credit += Number(r.credit || 0);
    }

    let portfolioTotal = 0;
    let portfolioCount = 0;
    const EPS = 0.001;

    for (const k in docs) {
      const open = isRecaudo ? (docs[k].debit - docs[k].credit) : (docs[k].credit - docs[k].debit);
      if (open > EPS) {
        portfolioTotal += open;
        portfolioCount++;
      }
    }

    let sqlMonth = isRecaudo ? `
      SELECT 
        COALESCE(SUM(l.debit), 0) as total_11
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date >= {:startDateStr} AND t.date <= {:endDateStr}
        AND (tt.code = 'RC' OR tt.code LIKE 'RC%' OR t.number LIKE 'RC%')
        AND a.code LIKE '11%'
    ` : `
      SELECT 
        COALESCE(SUM(l.credit), 0) as total_11
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date >= {:startDateStr} AND t.date <= {:endDateStr}
        AND (tt.code = 'CE' OR tt.code LIKE 'CE%' OR t.number LIKE 'CE%' OR t.number LIKE 'CG%' OR t.number LIKE 'EF%')
        AND a.code LIKE '11%'
    `;

    const monthBinds = {
      startDateStr: startDate,
      endDateStr: endDate + " 23:59:59"
    };
    if (branchId) {
      sqlMonth += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      monthBinds.branchId = branchId;
    }
    if (costCenterId) {
      sqlMonth += " AND l.cost_center_id = {:costCenterId}";
      monthBinds.costCenterId = costCenterId;
    }

    const monthQuery = $app.db().newQuery(sqlMonth);
    monthQuery.bind(monthBinds);

    const monthData = new DynamicModel({ total_11: -0 });
    monthQuery.one(monthData);

    let monthTotal = Number(monthData.total_11 || 0);

    return c.json(200, {
      mode: isRecaudo ? 'recaudos' : 'egresos',
      portfolioTotal,
      portfolioCount,
      monthTotal,
      startDate,
      endDate,
      asOfDate
    });
  } catch (err) {
    return c.json(500, { error: "Error obteniendo métricas de tesorería: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-portfolio-aging", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let mode = String(queryParams.mode || "cxc").trim();
  let thirdType = String(queryParams.thirdType || "").trim().toUpperCase();
  let sellerId = String(queryParams.sellerId || "").trim();
  let asOfDate = String(queryParams.asOfDate || "").trim();

  if (!asOfDate) {
    asOfDate = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
  } else {
    asOfDate = asOfDate.slice(0, 10);
  }

  try {
    const isCxC = mode === 'cxc';
    const accountPrefixes = isCxC ? ['13'] : ['22', '23', '25'];
    const filterClause = accountPrefixes.map(p => `a.code LIKE '${p}%'`).join(' OR ');

    let sqlAging = `
      SELECT
        l.id,
        l.debit,
        l.credit,
        l.cross_doc_ref,
        COALESCE(l.cross_doc_date, '') AS line_cross_doc_date,
        COALESCE(l.due_date, '') AS line_due_date,
        l.account_id,
        a.code AS account_code,
        a.name AS account_name,
        a.nature AS account_nature,
        a.maneja_cruce AS account_maneja_cruce,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_party_id,
        COALESCE(tp.name, 'Sin tercero') AS third_party_name,
        COALESCE(tp.doc_number, '') AS third_party_doc,
        COALESCE(tp.type, 'OTRO') AS third_party_type,
        COALESCE(tp.advisor, '') AS tp_advisor,
        COALESCE(seller_tp.name, 'Sin Vendedor') AS seller_name,
        COALESCE(seller_tp.doc_number, '') AS seller_doc,
        t.date AS tx_date,
        COALESCE(t.payment_days, tp.payment_days, 0) AS tx_payment_days
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
      LEFT JOIN third_parties seller_tp ON seller_tp.id = tp.advisor
      WHERE t.status = 'active'
        AND t.date <= {:asOfDateLimit}
        AND (${filterClause})
    `;

    const binds = { asOfDateLimit: asOfDate + " 23:59:59" };
    if (branchId) {
      sqlAging += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      binds.branchId = branchId;
    }
    if (costCenterId) {
      sqlAging += " AND l.cost_center_id = {:costCenterId}";
      binds.costCenterId = costCenterId;
    }

    const query = $app.db().newQuery(sqlAging);
    query.bind(binds);

    const data = arrayOf(new DynamicModel({
      id: "",
      debit: -0,
      credit: -0,
      cross_doc_ref: "",
      line_cross_doc_date: "",
      line_due_date: "",
      account_id: "",
      account_code: "",
      account_name: "",
      account_nature: "",
      account_maneja_cruce: 0,
      third_party_id: "",
      third_party_name: "",
      third_party_doc: "",
      third_party_type: "",
      tp_advisor: "",
      seller_name: "",
      seller_doc: "",
      tx_date: "",
      tx_payment_days: 0
    }));
    query.all(data);

    const docs = {};
    const defaultNature = isCxC ? 'debit' : 'credit';

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const manejaCruce = row.account_maneja_cruce === 1 || row.account_maneja_cruce === true || row.account_maneja_cruce === "1" || row.account_maneja_cruce === "true";
      const refRaw = String(row.cross_doc_ref || '').trim();
      if (!manejaCruce && !refRaw) continue;

      const tpType = String(row.third_party_type || '').toUpperCase();
      if (thirdType && tpType !== thirdType) continue;

      const currentSellerId = String(row.tp_advisor || '').trim();
      if (sellerId) {
        if (sellerId === 'sin_vendedor') {
          if (currentSellerId) continue;
        } else if (currentSellerId !== sellerId) {
          continue;
        }
      }

      const accNature = String(row.account_nature || '').toLowerCase() || defaultNature;
      const ref = refRaw || 'SIN_DOC';
      const key = `${row.account_id}|${row.third_party_id}|${ref}`;
      const lineCrossDate = String(row.line_cross_doc_date || '').trim();
      const lineDueDate = String(row.line_due_date || '').trim();
      const effectiveDocDate = lineCrossDate || row.tx_date;

      if (!docs[key]) {
        docs[key] = {
          account_id: row.account_id,
          account_code: row.account_code,
          account_name: row.account_name,
          nature: accNature,
          third_id: row.third_party_id,
          third_name: row.third_party_name,
          third_doc: row.third_party_doc,
          third_type: tpType || 'OTRO',
          seller_id: currentSellerId,
          seller_name: row.seller_name || 'Sin Vendedor',
          seller_doc: row.seller_doc || '',
          doc_ref: ref,
          doc_date: effectiveDocDate,
          explicit_due_date: lineDueDate,
          payment_days: Number(row.tx_payment_days || 0),
          debit: 0,
          credit: 0
        };
      }

      const doc = docs[key];
      if (effectiveDocDate < String(doc.doc_date)) {
        doc.doc_date = effectiveDocDate;
        doc.payment_days = Number(row.tx_payment_days || 0);
        if (lineDueDate) {
          doc.explicit_due_date = lineDueDate;
        }
      }
      doc.debit += Number(row.debit || 0);
      doc.credit += Number(row.credit || 0);
    }

    const EPS = 0.0001;
    const items = [];

    function diffDays(fromDate, toDate) {
      const from = new Date(fromDate + "T00:00:00");
      const to = new Date(toDate + "T00:00:00");
      if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
      return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86400000));
    }

    function diffDaysSigned(fromDate, toDate) {
      const from = new Date(fromDate + "T00:00:00");
      const to = new Date(toDate + "T00:00:00");
      if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
      return Math.floor((to.getTime() - from.getTime()) / 86400000);
    }

    function addDays(dateStr, n) {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + Number(n || 0));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const r = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + r;
    }

    function agingBucket(openVal, expiredDays) {
      if (openVal < -0.0001) return 'saldo_a_favor';
      if (expiredDays < 0) return 'por_vencer';
      if (expiredDays <= 30) return 'b0_30';
      if (expiredDays <= 60) return 'b31_60';
      if (expiredDays <= 90) return 'b61_90';
      return 'b90p';
    }

    const keys = Object.keys(docs);
    for (let k = 0; k < keys.length; k++) {
      const d = docs[keys[k]];
      const open = d.nature === 'debit'
        ? Number(d.debit || 0) - Number(d.credit || 0)
        : Number(d.credit || 0) - Number(d.debit || 0);

      if (Math.abs(open) <= EPS) continue;

      const dateOnly = String(d.doc_date).split(" ")[0];
      const due_date = d.explicit_due_date ? String(d.explicit_due_date).split(" ")[0] : addDays(dateOnly, d.payment_days || 0);
      const expired_days = diffDaysSigned(due_date, asOfDate);
      const days = diffDays(dateOnly, asOfDate);

      items.push({
        account_id: d.account_id,
        account_code: d.account_code,
        account_name: d.account_name,
        nature: d.nature,
        third_id: d.third_id,
        third_name: d.third_name,
        third_doc: d.third_doc,
        third_type: d.third_type,
        seller_id: d.seller_id,
        seller_name: d.seller_name,
        seller_doc: d.seller_doc,
        doc_ref: d.doc_ref,
        doc_date: dateOnly,
        payment_days: d.payment_days,
        debit: d.debit,
        credit: d.credit,
        open: open,
        days: days,
        due_date: due_date,
        expired_days: expired_days,
        bucket: agingBucket(open, expired_days)
      });
    }

    items.sort((a, b) => {
      const aKey = `${a.account_code}|${a.third_name}|${a.doc_date}|${a.doc_ref}`;
      const bKey = `${b.account_code}|${b.third_name}|${b.doc_date}|${b.doc_ref}`;
      return aKey.localeCompare(bKey);
    });

    return c.json(200, items);
  } catch (err) {
    return c.json(500, { error: "Error en cartera optimizada: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-trial-balance", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let fromDate = String(queryParams.fromDate || '').trim();
  let toDate = String(queryParams.toDate || '').trim();

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  let includeThird = false;
  const it = String(queryParams.includeThird || '').trim();
  includeThird = (it === "true" || it === "1");

  let includeProperty = false;
  const ip = String(queryParams.includeProperty || '').trim();
  includeProperty = (ip === "true" || ip === "1");

  let accountPrefix = String(queryParams.accountPrefix || queryParams.accountCode || '').trim();
  accountPrefix = accountPrefix.replace(/[^a-zA-Z0-9]/g, "");

  try {
    let sql = "";
    let toDateLimit = toDate + " 23:59:59";
    let binds = {
      fromDate1: fromDate,
      fromDate2: fromDate,
      fromDate3: fromDate,
      toDate1: toDateLimit,
      toDate2: toDateLimit,
      toDate3: toDateLimit
    };
    let accountWhere = "";

    if (accountPrefix) {
      accountWhere = " AND a.code LIKE {:accountPrefixPattern} ";
      binds.accountPrefixPattern = accountPrefix + "%";
    }

    if (branchId) {
      accountWhere += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId} ";
      binds.branchId = branchId;
    }
    if (costCenterId) {
      accountWhere += " AND l.cost_center_id = {:costCenterId} ";
      binds.costCenterId = costCenterId;
    }

    if (includeThird && includeProperty) {
      sql = `
        SELECT
          l.account_id AS accountId,
          COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
          COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
          COALESCE(tp.doc_number, '') AS thirdPartyDoc,
          COALESCE(prop.id, '') AS propertyId,
          COALESCE(prop.code, '') AS propertyCode,
          COALESCE(prop.name, '') AS propertyName,
          SUM(CASE WHEN t.date < {:fromDate1} THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
          SUM(CASE WHEN t.date >= {:fromDate2} AND t.date <= {:toDate1} THEN l.debit ELSE 0 END) AS debitSum,
          SUM(CASE WHEN t.date >= {:fromDate3} AND t.date <= {:toDate2} THEN l.credit ELSE 0 END) AS creditSum
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        INNER JOIN accounts a ON a.id = l.account_id
        LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
        LEFT JOIN ph_invoices phi ON (
          (l.cross_doc_ref != '' AND (
            l.cross_doc_ref = phi.number
            OR l.cross_doc_ref LIKE phi.number || '-%'
          ))
          OR (t.cross_type = 'ph_invoices' AND t.cross_number != '' AND phi.number = t.cross_number)
          OR (l.cross_doc_ref = '' AND phi.tx_id = t.id AND (SELECT count(*) FROM ph_invoices WHERE tx_id = t.id) = 1)
        )
        LEFT JOIN ph_properties prop ON prop.id = COALESCE(
          phi.property_id,
          CASE WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) ELSE NULL END
        )
        WHERE t.status = 'active'
          AND t.date <= {:toDate3}
          ${accountWhere}
        GROUP BY
          l.account_id,
          COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
          COALESCE(prop.id, '')
      `;
    } else if (includeThird) {
      sql = `
        SELECT
          l.account_id AS accountId,
          COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
          COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
          COALESCE(tp.doc_number, '') AS thirdPartyDoc,
          SUM(CASE WHEN t.date < {:fromDate1} THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
          SUM(CASE WHEN t.date >= {:fromDate2} AND t.date <= {:toDate1} THEN l.debit ELSE 0 END) AS debitSum,
          SUM(CASE WHEN t.date >= {:fromDate3} AND t.date <= {:toDate2} THEN l.credit ELSE 0 END) AS creditSum
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        INNER JOIN accounts a ON a.id = l.account_id
        LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
        WHERE t.status = 'active'
          AND t.date <= {:toDate3}
          ${accountWhere}
        GROUP BY l.account_id, COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO')
      `;
    } else {
      sql = `
        SELECT
          l.account_id AS accountId,
          SUM(CASE WHEN t.date < {:fromDate1} THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
          SUM(CASE WHEN t.date >= {:fromDate2} AND t.date <= {:toDate1} THEN l.debit ELSE 0 END) AS debitSum,
          SUM(CASE WHEN t.date >= {:fromDate3} AND t.date <= {:toDate2} THEN l.credit ELSE 0 END) AS creditSum
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        INNER JOIN accounts a ON a.id = l.account_id
        WHERE t.status = 'active'
          AND t.date <= {:toDate3}
          ${accountWhere}
        GROUP BY l.account_id
      `;
    }

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    if (includeThird && includeProperty) {
      const data = arrayOf(new DynamicModel({
        accountId: "",
        thirdPartyId: "",
        thirdPartyName: "",
        thirdPartyDoc: "",
        propertyId: "",
        propertyCode: "",
        propertyName: "",
        prevBalance: -0,
        debitSum: -0,
        creditSum: -0
      }));
      query.all(data);
      return c.json(200, data);
    } else if (includeThird) {
      const data = arrayOf(new DynamicModel({
        accountId: "",
        thirdPartyId: "",
        thirdPartyName: "",
        thirdPartyDoc: "",
        prevBalance: -0,
        debitSum: -0,
        creditSum: -0
      }));
      query.all(data);
      return c.json(200, data);
    } else {
      const data = arrayOf(new DynamicModel({
        accountId: "",
        prevBalance: -0,
        debitSum: -0,
        creditSum: -0
      }));
      query.all(data);
      return c.json(200, data);
    }
  } catch (err) {
    return c.json(500, { error: "Error en balance de prueba optimizado: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-journal", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let fromDate = String(queryParams.fromDate || '').trim();
  let toDate = String(queryParams.toDate || '').trim();
  let txTypeId = String(queryParams.txTypeId || '').trim();

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  try {
    let sql = `
      SELECT
        t.date AS fecha,
        t.number AS comprobante,
        t.description AS descripcion,
        COALESCE(tp.name, 'Sin tercero') AS tercero,
        a.code AS accountCode,
        a.name AS accountName,
        l.debit AS debito,
        l.credit AS credito,
        t.tx_type_id AS typeId,
        COALESCE(tt.code, 'OTROS') AS typeCode,
        COALESCE(tt.name, 'Otros Comprobantes') AS typeName,
        COALESCE(b.name, 'Principal') AS sucursal
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      LEFT JOIN branches b ON b.id = COALESCE(l.branch_id, t.branch_id)
      WHERE t.status = 'active'
        AND t.date >= {:fromDate}
        AND t.date <= {:toDate}
    `;

    const binds = { fromDate, toDate: toDate + " 23:59:59" };
    if (txTypeId) {
      sql += " AND t.tx_type_id = {:txTypeId}";
      binds.txTypeId = txTypeId;
    }
    if (branchId) {
      sql += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      binds.branchId = branchId;
    }
    if (costCenterId) {
      sql += " AND l.cost_center_id = {:costCenterId}";
      binds.costCenterId = costCenterId;
    }

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    const data = arrayOf(new DynamicModel({
      fecha: "",
      comprobante: "",
      descripcion: "",
      tercero: "",
      accountCode: "",
      accountName: "",
      debito: -0,
      credito: -0,
      typeId: "",
      typeCode: "",
      typeName: "",
      sucursal: ""
    }));
    query.all(data);

    return c.json(200, data);
  } catch (err) {
    return c.json(500, { error: "Error en libro diario optimizado: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let fromDate = String(queryParams.fromDate || '').trim();
  let toDate = String(queryParams.toDate || '').trim();
  let accountIdsStr = String(queryParams.accountIds || '').trim();
  let thirdId = String(queryParams.thirdId || '').trim();

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  const accountIds = accountIdsStr ? accountIdsStr.split(",").filter(Boolean) : [];

  try {
    const openingBinds = { fromDate };
    const periodBinds = { fromDate, toDate: toDate + " 23:59:59" };

    let accountFilter = "";
    if (accountIds.length > 0) {
      const placeholders = [];
      accountIds.forEach((id, index) => {
        const key = `accId${index}`;
        placeholders.push(`{:${key}}`);
        openingBinds[key] = id;
        periodBinds[key] = id;
      });
      accountFilter = " AND l.account_id IN (" + placeholders.join(", ") + ") ";
    }

    let thirdFilter = "";
    if (thirdId) {
      thirdFilter = " AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = {:thirdId} ";
      openingBinds.thirdId = thirdId;
      periodBinds.thirdId = thirdId;
    }

    let extraCond = "";
    if (branchId) {
      extraCond += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId} ";
      openingBinds.branchId = branchId;
      periodBinds.branchId = branchId;
    }
    if (costCenterId) {
      extraCond += " AND l.cost_center_id = {:costCenterId} ";
      openingBinds.costCenterId = costCenterId;
      periodBinds.costCenterId = costCenterId;
    }

    const sqlOpening = `
      SELECT
        l.account_id AS accountId,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END) AS docCruce,
        SUM(l.debit - l.credit) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date < {:fromDate}
        ` + accountFilter + `
        ` + thirdFilter + `
        ` + extraCond + `
      GROUP BY
        l.account_id,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END)
    `;

    const queryOpening = $app.db().newQuery(sqlOpening);
    queryOpening.bind(openingBinds);
    const dataOpening = arrayOf(new DynamicModel({
      accountId: "",
      thirdId: "",
      docCruce: "",
      balance: -0
    }));
    queryOpening.all(dataOpening);

    const sqlPeriod = `
      SELECT
        t.date AS fecha,
        t.number AS comprobante,
        t.id AS txId,
        l.account_id AS accountId,
        a.code AS accountCode,
        a.name AS accountName,
        a.nature AS accountNature,
        a.maneja_cruce AS accountManejaCruce,
        COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
        COALESCE(tp.name, 'Sin tercero') AS thirdName,
        COALESCE(tp.doc_number, '') AS thirdDoc,
        COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
        COALESCE(l.description, t.description, '') AS descripcion,
        l.debit AS debito,
        l.credit AS credito
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
      WHERE t.status = 'active'
        AND t.date >= {:fromDate}
        AND t.date <= {:toDate}
        ` + accountFilter + `
        ` + thirdFilter + `
        ` + extraCond + `
    `;

    const queryPeriod = $app.db().newQuery(sqlPeriod);
    queryPeriod.bind(periodBinds);
    const dataPeriod = arrayOf(new DynamicModel({
      fecha: "",
      comprobante: "",
      txId: "",
      accountId: "",
      accountCode: "",
      accountName: "",
      accountNature: "",
      accountManejaCruce: 0,
      thirdId: "",
      thirdName: "",
      thirdDoc: "",
      doc_cruce: "",
      descripcion: "",
      debito: -0,
      credito: -0
    }));
    queryPeriod.all(dataPeriod);

    return c.json(200, {
      openingBalances: dataOpening,
      periodLines: dataPeriod
    });
  } catch (err) {
    return c.json(500, { error: "Error en libro auxiliar optimizado: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-cash-flow", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let fromDate = String(queryParams.fromDate || '').trim();
  let toDate = String(queryParams.toDate || '').trim();

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  function classifyCashFlow(accCode) {
    if (!accCode) return { category: "Operación", subcategory: "Otros Egresos" };
    const first = accCode.charAt(0);
    const group2 = accCode.substring(0, 2);
    const group4 = accCode.substring(0, 4);

    if (first === "4") return { category: "Operación", subcategory: "Ventas de Contado" };
    if (group2 === "13") return { category: "Operación", subcategory: "Recaudo de Clientes / Cartera" };
    if (group2 === "22" || group2 === "23") return { category: "Operación", subcategory: "Pago a Proveedores y Acreedores" };
    if (group2 === "25" || group4 === "5105" || group4 === "5205") return { category: "Operación", subcategory: "Nómina y Beneficios a Empleados" };
    if (group2 === "24") return { category: "Operación", subcategory: "Pago de Impuestos y Tasas" };
    if (first === "5" || first === "6") return { category: "Operación", subcategory: "Gastos y Costos Directos" };
    if (group2 === "15") return { category: "Inversión", subcategory: "Adquisición de Activos Fijos" };
    if (["12", "14", "16", "17", "18", "19"].includes(group2)) return { category: "Inversión", subcategory: "Inversiones y Otros Activos" };
    if (group2 === "21") return { category: "Financiación", subcategory: "Obligaciones Financieras (Créditos)" };
    if (first === "3") return { category: "Financiación", subcategory: "Aportes de Capital / Dividendos" };

    return { category: "Operación", subcategory: "Otros Movimientos Operativos" };
  }

  try {
    let extraCond = "";
    const initialBinds = { fromDate };
    const periodBinds = { fromDate, toDate: toDate + " 23:59:59" };

    if (branchId) {
      extraCond += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId} ";
      initialBinds.branchId = branchId;
      periodBinds.branchId = branchId;
    }
    if (costCenterId) {
      extraCond += " AND l.cost_center_id = {:costCenterId} ";
      initialBinds.costCenterId = costCenterId;
      periodBinds.costCenterId = costCenterId;
    }

    const sqlInitial = `
      SELECT COALESCE(SUM(l.debit - l.credit), 0) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date < {:fromDate}
        AND a.code LIKE '11%'
        ${extraCond}
    `;
    const queryInitial = $app.db().newQuery(sqlInitial);
    queryInitial.bind(initialBinds);
    const initialModel = new DynamicModel({ balance: -0 });
    queryInitial.one(initialModel);
    const initialBalance = Number(initialModel.balance) || 0;

    const sqlPeriod = `
      SELECT
        l.tx_id AS txId,
        t.date AS txDate,
        t.number AS txNumber,
        t.description AS txDescription,
        l.debit AS debit,
        l.credit AS credit,
        a.code AS accountCode,
        a.name AS accountName
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date >= {:fromDate}
        AND t.date <= {:toDate}
        ${extraCond}
        AND t.id IN (
          SELECT DISTINCT l2.tx_id
          FROM tx_lines l2
          INNER JOIN accounts a2 ON a2.id = l2.account_id
          WHERE a2.code LIKE '11%'
        )
    `;
    const queryPeriod = $app.db().newQuery(sqlPeriod);
    queryPeriod.bind(periodBinds);
    const periodData = arrayOf(new DynamicModel({
      txId: "",
      txDate: "",
      txNumber: "",
      txDescription: "",
      debit: -0,
      credit: -0,
      accountCode: "",
      accountName: ""
    }));
    queryPeriod.all(periodData);

    const txMap = {};
    for (const row of periodData) {
      if (!txMap[row.txId]) {
        txMap[row.txId] = {
          date: row.txDate,
          number: row.txNumber,
          description: row.txDescription,
          lines: []
        };
      }
      txMap[row.txId].lines.push({
        debit: Number(row.debit) || 0,
        credit: Number(row.credit) || 0,
        code: row.accountCode,
        name: row.accountName
      });
    }

    const flowItems = [];
    const txIds = Object.keys(txMap);

    for (const txId of txIds) {
      const tx = txMap[txId];
      const cashLines = [];
      const nonCashLines = [];

      for (const line of tx.lines) {
        if (line.code.indexOf('11') === 0) {
          cashLines.push(line);
        } else {
          nonCashLines.push(line);
        }
      }

      if (cashLines.length === 0) continue;

      const totalCashDebit = cashLines.reduce((s, cl) => s + cl.debit, 0);
      const totalCashCredit = cashLines.reduce((s, cl) => s + cl.credit, 0);
      const netCashChange = totalCashDebit - totalCashCredit;

      if (Math.abs(netCashChange) < 0.01) continue;

      const isFlowIn = netCashChange > 0;
      const flowAmount = Math.abs(netCashChange);

      let mainCounterpart = null;
      if (nonCashLines.length > 0) {
        nonCashLines.sort((a, b) => {
          const valA = Math.max(a.debit, a.credit);
          const valB = Math.max(b.debit, b.credit);
          return valB - valA;
        });
        mainCounterpart = nonCashLines[0];
      }

      const counterpartCode = mainCounterpart ? mainCounterpart.code : '';
      const counterpartName = mainCounterpart ? mainCounterpart.name : 'Transferencia / Ajuste';
      const classification = classifyCashFlow(counterpartCode);

      flowItems.push({
        type: isFlowIn ? 'Ingreso' : 'Egreso',
        amount: flowAmount,
        category: classification.category,
        subcategory: classification.subcategory,
        accountCode: counterpartCode || '11',
        accountName: counterpartName,
        txDate: tx.date,
        txNumber: tx.number,
        description: tx.description || 'Movimiento de disponible'
      });
    }

    return c.json(200, {
      initialBalance,
      flowItems
    });
  } catch (err) {
    return c.json(500, { error: "Error en flujo de caja optimizado: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-sales-by-seller", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();
  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";

  let startDate = String(queryParams.startDate || '').trim();
  let endDate = String(queryParams.endDate || '').trim();
  let sellerId = String(queryParams.sellerId || '').trim();

  if (!startDate || !endDate) {
    return c.json(400, { error: "Los parámetros startDate y endDate son requeridos." });
  }

  startDate = startDate.slice(0, 10);
  endDate = endDate.slice(0, 10);

  try {
    let sql = `
      SELECT
        inv.id AS invoice_id,
        inv.number AS invoice_number,
        inv.date AS invoice_date,
        COALESCE(inv.payment_method, 'EFECTIVO') AS payment_method,
        inv.status AS status,
        COALESCE(inv.subtotal, 0) AS subtotal,
        COALESCE(inv.iva_total, 0) AS iva_total,
        COALESCE(inv.ret_total, 0) AS ret_total,
        COALESCE(inv.total, 0) AS total,
        COALESCE(inv.seller_id, cust.advisor, '') AS seller_id,
        COALESCE(seller_tp.name, 'Sin Vendedor') AS seller_name,
        COALESCE(seller_tp.doc_number, '') AS seller_doc,
        COALESCE(inv.customer_id, '') AS customer_id,
        COALESCE(cust.name, 'Sin Cliente') AS customer_name,
        COALESCE(cust.doc_number, '') AS customer_doc
      FROM invoices inv
      LEFT JOIN third_parties cust ON cust.id = inv.customer_id
      LEFT JOIN third_parties seller_tp ON seller_tp.id = COALESCE(inv.seller_id, cust.advisor)
      WHERE inv.status != 'voided'
        AND inv.date >= {:startDate}
        AND inv.date <= {:endDateLimit}
    `;

    const binds = {
      startDate: startDate + " 00:00:00",
      endDateLimit: endDate + " 23:59:59"
    };

    if (branchId) {
      sql += " AND inv.branch_id = {:branchId}";
      binds.branchId = branchId;
    }

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    const data = arrayOf(new DynamicModel({
      invoice_id: "",
      invoice_number: "",
      invoice_date: "",
      payment_method: "",
      status: "",
      subtotal: -0,
      iva_total: -0,
      ret_total: -0,
      total: -0,
      seller_id: "",
      seller_name: "",
      seller_doc: "",
      customer_id: "",
      customer_name: "",
      customer_doc: ""
    }));
    query.all(data);

    const items = [];
    for (const row of data) {
      const rowSellerId = String(row.seller_id || '').trim();
      if (sellerId) {
        if (sellerId === 'sin_vendedor' || sellerId === 'NONE') {
          if (rowSellerId) continue;
        } else if (rowSellerId !== sellerId) {
          continue;
        }
      }

      items.push({
        invoice_id: row.invoice_id,
        invoice_number: row.invoice_number,
        invoice_date: String(row.invoice_date).split(" ")[0],
        payment_method: row.payment_method,
        status: row.status,
        subtotal: Number(row.subtotal || 0),
        iva_total: Number(row.iva_total || 0),
        ret_total: Number(row.ret_total || 0),
        total: Number(row.total || 0),
        seller_id: rowSellerId,
        seller_name: row.seller_name || 'Sin Vendedor',
        seller_doc: row.seller_doc || '',
        customer_id: row.customer_id,
        customer_name: row.customer_name || 'Sin Cliente',
        customer_doc: row.customer_doc || ''
      });
    }

    items.sort((a, b) => {
      const aKey = `${a.seller_name}|${a.invoice_date}|${a.invoice_number}`;
      const bKey = `${b.seller_name}|${b.invoice_date}|${b.invoice_number}`;
      return aKey.localeCompare(bKey);
    });

    return c.json(200, items);
  } catch (err) {
    return c.json(500, { error: "Error en reporte de ventas por vendedor: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-inventory-as-of", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();
  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";

  let asOfDate = String(queryParams.asOfDate || '').trim();

  if (!asOfDate) {
    asOfDate = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
  } else {
    asOfDate = asOfDate.slice(0, 10);
  }

  let warehouseId = String(queryParams.warehouseId || '').trim();
  let categoryId = String(queryParams.category || '').trim();
  let lineId = String(queryParams.line || '').trim();

  try {
    let prodSql = `SELECT id, code, name, unit, cost_price, stock_min, stock_max, categoria, linea FROM products WHERE type = 'BIEN' AND active = 1`;
    const prodBinds = {};
    if (categoryId) {
      prodSql += ` AND categoria = {:category}`;
      prodBinds.category = categoryId;
    }
    if (lineId) {
      prodSql += ` AND linea = {:line}`;
      prodBinds.line = lineId;
    }
    prodSql += ` ORDER BY code ASC`;

    const prodQuery = $app.db().newQuery(prodSql);
    prodQuery.bind(prodBinds);

    const prodsData = arrayOf(new DynamicModel({
      id: "",
      code: "",
      name: "",
      unit: "",
      cost_price: -0,
      stock_min: -0,
      stock_max: -0,
      categoria: "",
      linea: ""
    }));
    prodQuery.all(prodsData);

    const prodMap = {};
    for (const p of prodsData) {
      prodMap[p.id] = {
        id: p.id,
        code: p.code,
        name: p.name,
        unit: p.unit || 'UND',
        cost_price: Number(p.cost_price || 0),
        stock_min: p.stock_min !== null ? Number(p.stock_min) : null,
        stock_max: p.stock_max !== null ? Number(p.stock_max) : null,
        categoria: p.categoria || '',
        linea: p.linea || ''
      };
    }

    let movSql = `
      SELECT
        l.product_id,
        l.qty,
        l.unit_cost,
        l.line_order,
        m.id AS mov_id,
        m.mov_type,
        m.warehouse_id,
        m.dest_warehouse_id,
        m.date AS mov_date
      FROM inventory_movement_lines l
      INNER JOIN inventory_movements m ON m.id = l.movement_id
      WHERE m.status = 'applied'
        AND m.date <= {:asOfDateLimit}
    `;

    const movBinds = { asOfDateLimit: asOfDate + " 23:59:59" };
    if (warehouseId) {
      movSql += ` AND (m.warehouse_id = {:warehouseId} OR m.dest_warehouse_id = {:warehouseId})`;
      movBinds.warehouseId = warehouseId;
    }
    if (branchId) {
      movSql += ` AND m.branch_id = {:branchId}`;
      movBinds.branchId = branchId;
    }

    movSql += ` ORDER BY m.date ASC, l.line_order ASC`;

    const movQuery = $app.db().newQuery(movSql);
    movQuery.bind(movBinds);

    const movsData = arrayOf(new DynamicModel({
      product_id: "",
      qty: -0,
      unit_cost: -0,
      line_order: 0,
      mov_id: "",
      mov_type: "",
      warehouse_id: "",
      dest_warehouse_id: "",
      mov_date: ""
    }));
    movQuery.all(movsData);

    const stockMap = {};

    for (const mov of movsData) {
      if (!prodMap[mov.product_id]) continue;

      const prodId = mov.product_id;
      const qty = Number(mov.qty || 0);
      const cost = Number(mov.unit_cost || 0);
      const mType = mov.mov_type;
      const whOrig = mov.warehouse_id;
      const whDest = mov.dest_warehouse_id;

      const adjust = (pId, wId, qtyDelta, unitCost) => {
        if (!wId) return 0;
        if (warehouseId && wId !== warehouseId) return 0;

        const key = pId + "_" + wId;
        if (!stockMap[key]) {
          stockMap[key] = {
            product_id: pId,
            warehouse_id: wId,
            qty_on_hand: 0,
            avg_cost: prodMap[pId] ? prodMap[pId].cost_price : 0,
            last_mov_date: mov.mov_date
          };
        }

        const st = stockMap[key];
        const curQty = st.qty_on_hand;
        const curCost = st.avg_cost;
        const newQty = curQty + qtyDelta;
        let newCost = curCost;

        if (qtyDelta > 0 && unitCost !== null && unitCost !== undefined && unitCost > 0) {
          if (newQty > 0) {
            newCost = ((curQty * curCost) + (qtyDelta * unitCost)) / newQty;
          } else {
            newCost = unitCost;
          }
          newCost = Math.round(newCost * 100) / 100;
        }

        st.qty_on_hand = newQty;
        st.avg_cost = newCost;
        st.last_mov_date = mov.mov_date;
        return newCost;
      };

      if (mType === "ENTRADA" || mType === "AJUSTE_POSITIVO") {
        adjust(prodId, whOrig, qty, cost);
      } else if (mType === "SALIDA" || mType === "AJUSTE_NEGATIVO") {
        adjust(prodId, whOrig, -qty, null);
      } else if (mType === "TRASLADO") {
        const keyOrig = prodId + "_" + whOrig;
        const origAvg = stockMap[keyOrig] ? stockMap[keyOrig].avg_cost : (prodMap[prodId]?.cost_price || 0);
        adjust(prodId, whOrig, -qty, null);
        if (whDest) {
          adjust(prodId, whDest, qty, origAvg);
        }
      }
    }

    const results = [];
    const keys = Object.keys(stockMap);

    for (const k of keys) {
      const st = stockMap[k];
      const prod = prodMap[st.product_id];
      if (!prod) continue;

      results.push({
        product_id: st.product_id,
        warehouse_id: st.warehouse_id,
        qty_on_hand: st.qty_on_hand,
        avg_cost: st.avg_cost,
        last_mov_date: st.last_mov_date,
        expand: {
          product_id: prod
        }
      });
    }

    return c.json(200, {
      asOfDate: asOfDate,
      items: results
    });
  } catch (err) {
    return c.json(500, { error: "Error obteniendo inventario a fecha de corte: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-cost-centers", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};

  let branchId = String(queryParams.branch_id || queryParams.branch || '').trim();
  if (Array.isArray(branchId)) branchId = String(branchId[0] || '').trim();

  let costCenterId = String(queryParams.cost_center_id || queryParams.cost_center || queryParams.costCenterId || '').trim();
  if (Array.isArray(costCenterId)) costCenterId = String(costCenterId[0] || '').trim();

  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null" || branchId === "undefined") branchId = "";
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null" || costCenterId === "undefined") costCenterId = "";

  let fromDate = String(queryParams.fromDate || '').trim();
  let toDate = String(queryParams.toDate || '').trim();

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  try {
    let sql = `
      SELECT
        l.cost_center_id AS cost_center_id,
        COALESCE(cc.code, 'SIN_CENCO') AS cost_center_code,
        COALESCE(cc.name, 'Sin centro de costo') AS cost_center_name,
        SUM(l.debit) AS debit,
        SUM(l.credit) AS credit,
        SUM(l.debit - l.credit) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      LEFT JOIN cost_centers cc ON cc.id = l.cost_center_id
      WHERE t.status = 'active'
        AND t.date >= {:fromDate}
        AND t.date <= {:toDateLimit}
    `;

    const binds = {
      fromDate: fromDate,
      toDateLimit: toDate + " 23:59:59"
    };

    if (branchId) {
      sql += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      binds.branchId = branchId;
    }
    if (costCenterId) {
      sql += " AND l.cost_center_id = {:costCenterId}";
      binds.costCenterId = costCenterId;
    }

    sql += " GROUP BY l.cost_center_id";

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    const data = arrayOf(new DynamicModel({
      cost_center_id: "",
      cost_center_code: "",
      cost_center_name: "",
      debit: -0,
      credit: -0,
      balance: -0
    }));
    query.all(data);

    return c.json(200, data);
  } catch (err) {
    return c.json(500, { error: "Error en reporte de centros de costo: " + err.message });
  }
});
