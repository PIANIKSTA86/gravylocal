/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — reports_optimized.pb.js
 * 
 * Endpoints optimizados para la generación inmediata de reportes contables:
 * - GET /api/gravy/report-balances
 * - GET /api/gravy/report-portfolio-aging
 */

routerAdd("GET", "/api/gravy/report-balances", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  let startDate = "";
  try {
    startDate = c.queryParam("startDate") || "";
  } catch (_) {
    try {
      startDate = c.QueryParam("startDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.startDate) {
          startDate = Array.isArray(q.startDate) ? q.startDate[0] : q.startDate;
        }
      } catch (_) {}
    }
  }

  let endDate = "";
  try {
    endDate = c.queryParam("endDate") || "";
  } catch (_) {
    try {
      endDate = c.QueryParam("endDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.endDate) {
          endDate = Array.isArray(q.endDate) ? q.endDate[0] : q.endDate;
        }
      } catch (_) {}
    }
  }

  if (!endDate) {
    return c.json(400, { error: "El parámetro endDate es requerido." });
  }

  // Normalizar fechas a formato de 10 caracteres (YYYY-MM-DD)
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

    if (startDate) {
      sql += " AND t.date >= {:startDate}";
    }

    sql += " GROUP BY l.account_id";

    const query = $app.db().newQuery(sql);
    const binds = { endDate };
    if (startDate) {
      binds.startDate = startDate;
    }
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

  let mode = "recaudos";
  try {
    mode = c.queryParam("mode") || "recaudos";
  } catch (_) {
    try { mode = c.QueryParam("mode") || "recaudos"; } catch (_) {}
  }
  mode = String(mode).toLowerCase();

  let asOfDate = "";
  try { asOfDate = c.queryParam("asOfDate") || ""; } catch (_) {
    try { asOfDate = c.QueryParam("asOfDate") || ""; } catch (_) {}
  }
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

  let startDate = defaultStart;
  let endDate = defaultEnd;
  try { startDate = c.queryParam("startDate") || startDate; } catch (_) {}
  try { endDate = c.queryParam("endDate") || endDate; } catch (_) {}

  try {
    const isRecaudo = mode === 'recaudos' || mode === 'cxc' || mode === 'rc';
    const accountPrefixes = isRecaudo ? ['13'] : ['22', '23', '25'];
    const filterClause = accountPrefixes.map(p => `a.code LIKE '${p}%'`).join(' OR ');

    // 1. Cartera / Obligaciones Pendientes (aging grouping)
    const sqlAging = `
      SELECT
        l.account_id,
        a.code AS account_code,
        a.maneja_cruce AS account_maneja_cruce,
        COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS third_party_id,
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

    const agingQuery = $app.db().newQuery(sqlAging);
    agingQuery.bind({ asOfDateLimit: asOfDate + " 23:59:59" });

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

    // 2. Suma de Recaudos / Egresos del mes (líneas de cuentas 11xx en transacciones activas RC / CE)
    const sqlMonth = isRecaudo ? `
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

    const monthQuery = $app.db().newQuery(sqlMonth);
    monthQuery.bind({
      startDateStr: startDate,
      endDateStr: endDate + " 23:59:59"
    });

    const monthData = new DynamicModel({ total_11: -0 });
    monthQuery.one(monthData);

    let monthTotal = Number(monthData.total_11 || 0);

    if (monthTotal <= 0) {
      const sqlFallback = isRecaudo ? `
        SELECT COALESCE(SUM(l.debit), 0) as total_fallback
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
        WHERE t.status = 'active'
          AND t.date >= {:startDateStr} AND t.date <= {:endDateStr}
          AND (tt.code = 'RC' OR tt.code LIKE 'RC%' OR t.number LIKE 'RC%')
      ` : `
        SELECT COALESCE(SUM(l.credit), 0) as total_fallback
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
        WHERE t.status = 'active'
          AND t.date >= {:startDateStr} AND t.date <= {:endDateStr}
          AND (tt.code = 'CE' OR tt.code LIKE 'CE%' OR t.number LIKE 'CE%' OR t.number LIKE 'CG%' OR t.number LIKE 'EF%')
      `;
      const fbQuery = $app.db().newQuery(sqlFallback);
      fbQuery.bind({
        startDateStr: startDate,
        endDateStr: endDate + " 23:59:59"
      });
      const fbData = new DynamicModel({ total_fallback: -0 });
      fbQuery.one(fbData);
      monthTotal = Number(fbData.total_fallback || 0) / 2;
    }

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

  let mode = "cxc";
  try {
    mode = c.queryParam("mode") || "cxc";
  } catch (_) {
    try {
      mode = c.QueryParam("mode") || "cxc";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.mode) {
          mode = Array.isArray(q.mode) ? q.mode[0] : q.mode;
        }
      } catch (_) {}
    }
  }

  let thirdType = "";
  try {
    thirdType = c.queryParam("thirdType") || "";
  } catch (_) {
    try {
      thirdType = c.QueryParam("thirdType") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.thirdType) {
          thirdType = Array.isArray(q.thirdType) ? q.thirdType[0] : q.thirdType;
        }
      } catch (_) {}
    }
  }
  thirdType = thirdType.trim().toUpperCase();

  let sellerId = "";
  try {
    sellerId = c.queryParam("sellerId") || "";
  } catch (_) {
    try {
      sellerId = c.QueryParam("sellerId") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.sellerId) {
          sellerId = Array.isArray(q.sellerId) ? q.sellerId[0] : q.sellerId;
        }
      } catch (_) {}
    }
  }
  sellerId = sellerId.trim();

  let asOfDate = "";
  try {
    asOfDate = c.queryParam("asOfDate") || "";
  } catch (_) {
    try {
      asOfDate = c.QueryParam("asOfDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.asOfDate) {
          asOfDate = Array.isArray(q.asOfDate) ? q.asOfDate[0] : q.asOfDate;
        }
      } catch (_) {}
    }
  }

  if (!asOfDate) {
    return c.json(400, { error: "El parámetro asOfDate es requerido." });
  }

  // Normalizar fecha de corte a YYYY-MM-DD
  asOfDate = asOfDate.slice(0, 10);

  try {
    const prefixes = mode === 'cxc' ? ['13'] : ['22', '23', '25'];
    const filterClause = prefixes.map(p => `a.code LIKE '${p}%'`).join(' OR ');

    let sql = `
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
        COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS third_party_id,
        COALESCE(tp.name, 'Sin tercero') AS third_party_name,
        COALESCE(tp.doc_number, '') AS third_party_doc,
        COALESCE(tp.type, 'OTRO') AS third_party_type,
        COALESCE(inv.seller_id, tp.advisor, '') AS seller_id,
        COALESCE(seller_tp.name, 'Sin Vendedor') AS seller_name,
        COALESCE(seller_tp.doc_number, '') AS seller_doc,
        t.date AS tx_date,
        COALESCE(t.payment_days, 0) AS tx_payment_days
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      LEFT JOIN third_parties tp ON tp.id = COALESCE(l.third_party_id, t.third_party_id)
      LEFT JOIN invoices inv ON inv.tx_id = t.id
      LEFT JOIN third_parties seller_tp ON seller_tp.id = COALESCE(inv.seller_id, tp.advisor)
      WHERE t.status = 'active'
        AND t.date <= {:asOfDateLimit}
        AND (${filterClause})
    `;

    const query = $app.db().newQuery(sql);
    query.bind({ asOfDateLimit: asOfDate + " 23:59:59" });

    const data = arrayOf(new DynamicModel({
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
      seller_id: "",
      seller_name: "",
      seller_doc: "",
      tx_date: "",
      tx_payment_days: 0
    }));
    query.all(data);

    const docs = {};
    const defaultNature = mode === 'cxc' ? 'debit' : 'credit';

    for (const row of data) {
      const manejaCruce = row.account_maneja_cruce === 1 || row.account_maneja_cruce === true;
      const refRaw = String(row.cross_doc_ref || '').trim();
      if (!manejaCruce && !refRaw) continue;

      const tpType = String(row.third_party_type || '').toUpperCase();
      if (thirdType && tpType !== thirdType) continue;

      const rowSellerId = String(row.seller_id || '').trim();
      if (sellerId) {
        if (sellerId === 'NONE' || sellerId === 'sin_vendedor') {
          if (rowSellerId) continue;
        } else if (rowSellerId !== sellerId) {
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
          seller_id: rowSellerId,
          seller_name: row.seller_name || 'Sin Vendedor',
          seller_doc: row.seller_doc || '',
          doc_ref: ref,
          doc_date: effectiveDocDate,
          explicit_due_date: lineDueDate,
          payment_days: Number(row.tx_payment_days || 0),
          debit: 0,
          credit: 0,
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

    // Helper functions for Date
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
    for (const key of keys) {
      const d = docs[key];
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
    return c.json(500, { error: "Error en cartera por edades: " + err.message });
  }
});

routerAdd("GET", "/api/gravy/report-trial-balance", (c) => {
  const authRecord = c.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(c).authRecord : null);
  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  let fromDate = "";
  try {
    fromDate = c.queryParam("fromDate") || "";
  } catch (_) {
    try {
      fromDate = c.QueryParam("fromDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.fromDate) {
          fromDate = Array.isArray(q.fromDate) ? q.fromDate[0] : q.fromDate;
        }
      } catch (_) {}
    }
  }

  let toDate = "";
  try {
    toDate = c.queryParam("toDate") || "";
  } catch (_) {
    try {
      toDate = c.QueryParam("toDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.toDate) {
          toDate = Array.isArray(q.toDate) ? q.toDate[0] : q.toDate;
        }
      } catch (_) {}
    }
  }

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  let includeThird = false;
  try {
    const it = c.queryParam("includeThird") || "";
    includeThird = (it === "true" || it === "1");
  } catch (_) {
    try {
      const it = c.QueryParam("includeThird") || "";
      includeThird = (it === "true" || it === "1");
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.includeThird) {
          const val = Array.isArray(q.includeThird) ? q.includeThird[0] : q.includeThird;
          includeThird = (val === "true" || val === "1");
        }
      } catch (_) {}
    }
  }

  let accountPrefix = "";
  try {
    accountPrefix = (c.queryParam("accountPrefix") || c.queryParam("accountCode") || "").trim();
  } catch (_) {
    try {
      accountPrefix = (c.QueryParam("accountPrefix") || c.QueryParam("accountCode") || "").trim();
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && (q.accountPrefix || q.accountCode)) {
          const val = q.accountPrefix || q.accountCode;
          accountPrefix = (Array.isArray(val) ? val[0] : val).trim();
        }
      } catch (_) {}
    }
  }
  accountPrefix = accountPrefix.replace(/[^a-zA-Z0-9]/g, "");

  try {
    let sql = "";
    let binds = { fromDate, toDate: toDate + " 23:59:59" };
    let accountWhere = "";

    if (accountPrefix) {
      accountWhere = " AND a.code LIKE {:accountPrefixPattern} ";
      binds.accountPrefixPattern = accountPrefix + "%";
    }

    if (includeThird) {
      sql = `
        SELECT
          l.account_id AS accountId,
          COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
          COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
          COALESCE(tp.doc_number, '') AS thirdPartyDoc,
          SUM(CASE WHEN t.date < {:fromDate} THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
          SUM(CASE WHEN t.date >= {:fromDate} AND t.date <= {:toDate} THEN l.debit ELSE 0 END) AS debitSum,
          SUM(CASE WHEN t.date >= {:fromDate} AND t.date <= {:toDate} THEN l.credit ELSE 0 END) AS creditSum
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        INNER JOIN accounts a ON a.id = l.account_id
        LEFT JOIN third_parties tp ON tp.id = COALESCE(l.third_party_id, t.third_party_id)
        WHERE t.status = 'active'
          AND t.date <= {:toDate}
          ${accountWhere}
        GROUP BY l.account_id, COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO')
      `;
    } else {
      sql = `
        SELECT
          l.account_id AS accountId,
          SUM(CASE WHEN t.date < {:fromDate} THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
          SUM(CASE WHEN t.date >= {:fromDate} AND t.date <= {:toDate} THEN l.debit ELSE 0 END) AS debitSum,
          SUM(CASE WHEN t.date >= {:fromDate} AND t.date <= {:toDate} THEN l.credit ELSE 0 END) AS creditSum
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        INNER JOIN accounts a ON a.id = l.account_id
        WHERE t.status = 'active'
          AND t.date <= {:toDate}
          ${accountWhere}
        GROUP BY l.account_id
      `;
    }

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    if (includeThird) {
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

  let fromDate = "";
  try {
    fromDate = c.queryParam("fromDate") || "";
  } catch (_) {
    try {
      fromDate = c.QueryParam("fromDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.fromDate) {
          fromDate = Array.isArray(q.fromDate) ? q.fromDate[0] : q.fromDate;
        }
      } catch (_) {}
    }
  }

  let toDate = "";
  try {
    toDate = c.queryParam("toDate") || "";
  } catch (_) {
    try {
      toDate = c.QueryParam("toDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.toDate) {
          toDate = Array.isArray(q.toDate) ? q.toDate[0] : q.toDate;
        }
      } catch (_) {}
    }
  }

  let txTypeId = "";
  try {
    txTypeId = c.queryParam("txTypeId") || "";
  } catch (_) {
    try {
      txTypeId = c.QueryParam("txTypeId") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.txTypeId) {
          txTypeId = Array.isArray(q.txTypeId) ? q.txTypeId[0] : q.txTypeId;
        }
      } catch (_) {}
    }
  }

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
        COALESCE(tt.name, 'Otros Comprobantes') AS typeName
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      LEFT JOIN third_parties tp ON tp.id = COALESCE(l.third_party_id, t.third_party_id)
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      WHERE t.status = 'active'
        AND t.date >= {:fromDate}
        AND t.date <= {:toDate}
    `;

    const binds = { fromDate, toDate: toDate + " 23:59:59" };
    if (txTypeId) {
      sql += " AND t.tx_type_id = {:txTypeId}";
      binds.txTypeId = txTypeId;
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
      typeName: ""
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

  let fromDate = "";
  try {
    fromDate = c.queryParam("fromDate") || "";
  } catch (_) {
    try {
      fromDate = c.QueryParam("fromDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.fromDate) {
          fromDate = Array.isArray(q.fromDate) ? q.fromDate[0] : q.fromDate;
        }
      } catch (_) {}
    }
  }

  let toDate = "";
  try {
    toDate = c.queryParam("toDate") || "";
  } catch (_) {
    try {
      toDate = c.QueryParam("toDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.toDate) {
          toDate = Array.isArray(q.toDate) ? q.toDate[0] : q.toDate;
        }
      } catch (_) {}
    }
  }

  let accountIdsStr = "";
  try {
    accountIdsStr = c.queryParam("accountIds") || "";
  } catch (_) {
    try {
      accountIdsStr = c.QueryParam("accountIds") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.accountIds) {
          accountIdsStr = Array.isArray(q.accountIds) ? q.accountIds[0] : q.accountIds;
        }
      } catch (_) {}
    }
  }

  let thirdId = "";
  try {
    thirdId = c.queryParam("thirdId") || "";
  } catch (_) {
    try {
      thirdId = c.QueryParam("thirdId") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.thirdId) {
          thirdId = Array.isArray(q.thirdId) ? q.thirdId[0] : q.thirdId;
        }
      } catch (_) {}
    }
  }

  if (!fromDate || !toDate) {
    return c.json(400, { error: "Los parámetros fromDate y toDate son requeridos." });
  }

  fromDate = fromDate.slice(0, 10);
  toDate = toDate.slice(0, 10);

  const accountIds = accountIdsStr ? accountIdsStr.split(",").filter(Boolean) : [];

  try {
    // 1. Build Binds and Dynamic SQL Filters
    const binds = { fromDate, toDate: toDate + " 23:59:59" };
    let accountFilter = "";
    if (accountIds.length > 0) {
      const placeholders = [];
      accountIds.forEach((id, index) => {
        const key = `accId${index}`;
        placeholders.push(`{:${key}}`);
        binds[key] = id;
      });
      accountFilter = " AND l.account_id IN (" + placeholders.join(", ") + ") ";
    }

    let thirdFilter = "";
    if (thirdId) {
      thirdFilter = " AND (l.third_party_id = {:thirdId} OR t.third_party_id = {:thirdId}) ";
      binds.thirdId = thirdId;
    }

    // 2. Query Opening Balances (date < fromDate)
    const sqlOpening = `
      SELECT
        l.account_id AS accountId,
        COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS thirdId,
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END) AS docCruce,
        SUM(l.debit - l.credit) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date < {:fromDate}
        ` + accountFilter + `
        ` + thirdFilter + `
      GROUP BY
        l.account_id,
        COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO'),
        (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END)
    `;

    const queryOpening = $app.db().newQuery(sqlOpening);
    queryOpening.bind(binds);
    const dataOpening = arrayOf(new DynamicModel({
      accountId: "",
      thirdId: "",
      docCruce: "",
      balance: -0
    }));
    queryOpening.all(dataOpening);

    // 3. Query Period lines (fromDate <= date <= toDate)
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
        COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS thirdId,
        COALESCE(tp.name, 'Sin tercero') AS thirdName,
        COALESCE(tp.doc_number, '') AS thirdDoc,
        COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
        COALESCE(l.description, t.description, '') AS descripcion,
        l.debit AS debito,
        l.credit AS credito
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      LEFT JOIN third_parties tp ON tp.id = COALESCE(l.third_party_id, t.third_party_id)
      WHERE t.status = 'active'
        AND t.date >= {:fromDate}
        AND t.date <= {:toDate}
        ` + accountFilter + `
        ` + thirdFilter + `
    `;

    const queryPeriod = $app.db().newQuery(sqlPeriod);
    queryPeriod.bind(binds);
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

  let fromDate = "";
  try {
    fromDate = c.queryParam("fromDate") || "";
  } catch (_) {
    try {
      fromDate = c.QueryParam("fromDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.fromDate) {
          fromDate = Array.isArray(q.fromDate) ? q.fromDate[0] : q.fromDate;
        }
      } catch (_) {}
    }
  }

  let toDate = "";
  try {
    toDate = c.queryParam("toDate") || "";
  } catch (_) {
    try {
      toDate = c.QueryParam("toDate") || "";
    } catch (_) {
      try {
        const q = c.requestInfo().query;
        if (q && q.toDate) {
          toDate = Array.isArray(q.toDate) ? q.toDate[0] : q.toDate;
        }
      } catch (_) {}
    }
  }

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

    if (first === "4") {
      return { category: "Operación", subcategory: "Ventas de Contado" };
    }
    if (group2 === "13") {
      return { category: "Operación", subcategory: "Recaudo de Clientes / Cartera" };
    }
    if (group2 === "22" || group2 === "23") {
      return { category: "Operación", subcategory: "Pago a Proveedores y Acreedores" };
    }
    if (group2 === "25" || group4 === "5105" || group4 === "5205") {
      return { category: "Operación", subcategory: "Nómina y Beneficios a Empleados" };
    }
    if (group2 === "24") {
      return { category: "Operación", subcategory: "Pago de Impuestos y Tasas" };
    }
    if (first === "5" || first === "6") {
      return { category: "Operación", subcategory: "Gastos y Costos Directos" };
    }
    if (group2 === "15") {
      return { category: "Inversión", subcategory: "Adquisición de Activos Fijos" };
    }
    if (["12", "14", "16", "17", "18", "19"].includes(group2)) {
      return { category: "Inversión", subcategory: "Inversiones y Otros Activos" };
    }
    if (group2 === "21") {
      return { category: "Financiación", subcategory: "Obligaciones Financieras (Créditos)" };
    }
    if (first === "3") {
      return { category: "Financiación", subcategory: "Aportes de Capital / Dividendos" };
    }

    return { category: "Operación", subcategory: "Otros Movimientos Operativos" };
  }

  try {
    // 1. Query Initial Balance of group 11 accounts before fromDate
    const sqlInitial = `
      SELECT COALESCE(SUM(l.debit - l.credit), 0) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date < {:fromDate}
        AND a.code LIKE '11%'
    `;
    const queryInitial = $app.db().newQuery(sqlInitial);
    queryInitial.bind({ fromDate });
    const initialModel = new DynamicModel({ balance: -0 });
    queryInitial.one(initialModel);
    const initialBalance = Number(initialModel.balance) || 0;

    // 2. Query transactions & lines in period with Cash flow impact (group 11)
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
        AND t.id IN (
          SELECT DISTINCT l2.tx_id
          FROM tx_lines l2
          INNER JOIN accounts a2 ON a2.id = l2.account_id
          WHERE a2.code LIKE '11%'
        )
    `;
    const queryPeriod = $app.db().newQuery(sqlPeriod);
    queryPeriod.bind({ fromDate, toDate: toDate + " 23:59:59" });
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

    // 3. Process data in JS VM
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
        if (line.code.indexOf('11') === 0) { // code starts with '11'
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
  let authRecord = null;
  try { authRecord = c.auth; } catch (_) {}
  if (!authRecord) {
    try {
      const info = c.requestInfo ? c.requestInfo() : null;
      if (info) authRecord = info.authRecord || info.admin;
    } catch (_) {}
  }
  if (!authRecord) {
    try {
      if (typeof $apis !== "undefined" && $apis.requestInfo) {
        const info = $apis.requestInfo(c);
        if (info) authRecord = info.authRecord || info.admin;
      }
    } catch (_) {}
  }

  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const readQueryParam = (cCtx, key) => {
    try {
      if (cCtx && typeof cCtx.requestInfo === "function") {
        const info = cCtx.requestInfo();
        if (info && info.query) {
          const v = info.query[key];
          if (v !== undefined && v !== null) {
            return String(Array.isArray(v) ? v[0] : v).trim();
          }
        }
      }
    } catch (_) {}

    try {
      if (cCtx && typeof cCtx.queryParam === "function") {
        const v = cCtx.queryParam(key);
        if (v) return String(v).trim();
      }
    } catch (_) {}

    try {
      if (cCtx && typeof cCtx.QueryParam === "function") {
        const v = cCtx.QueryParam(key);
        if (v) return String(v).trim();
      }
    } catch (_) {}

    try {
      if (typeof $apis !== "undefined" && $apis.requestInfo) {
        const info = $apis.requestInfo(cCtx);
        if (info && info.query) {
          const v = info.query[key];
          if (v !== undefined && v !== null) {
            return String(Array.isArray(v) ? v[0] : v).trim();
          }
        }
      }
    } catch (_) {}

    return "";
  };

  let startDate = readQueryParam(c, "startDate");
  let endDate = readQueryParam(c, "endDate");
  let sellerId = readQueryParam(c, "sellerId");

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

    const query = $app.db().newQuery(sql);
    query.bind({
      startDate: startDate + " 00:00:00",
      endDateLimit: endDate + " 23:59:59"
    });

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
