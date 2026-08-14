/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — dashboard_summary.pb.js
 *
 * Endpoint: GET /api/gravy/dashboard-summary
 * Devuelve un consolidado de KPIs y métricas agregadas para el dashboard
 * en una sola consulta de alto rendimiento, evitando la descarga masiva de
 * líneas contables al cliente.
 *
 * Sección CORE  → KPIs operacionales (seguros para todos los roles)
 * Sección CONT  → KPIs financieros (activos, pasivos, ingresos, gastos)
 */

routerAdd("GET", "/api/gravy/dashboard-summary", (e) => {
  // 1. Autenticación
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { error: "No autenticado. Debes iniciar sesión." });
  }

  // Obtener branch_id de forma robusta y compatible en Echo/Goja
  let branchId = "";
  try {
    branchId = e.queryParam("branch_id") || "";
  } catch (_) {
    try {
      branchId = e.QueryParam("branch_id") || "";
    } catch (_) {
      try {
        const q = e.requestInfo().query;
        if (q && q.branch_id) {
          branchId = Array.isArray(q.branch_id) ? q.branch_id[0] : q.branch_id;
        }
      } catch (_) {}
    }
  }
  if (branchId === "TODAS" || branchId === "TODOS" || branchId === "ALL" || branchId === "null") branchId = "";

  // Obtener cost_center_id
  let costCenterId = "";
  try {
    costCenterId = e.queryParam("cost_center_id") || e.queryParam("cost_center") || "";
  } catch (_) {
    try {
      costCenterId = e.QueryParam("cost_center_id") || e.QueryParam("cost_center") || "";
    } catch (_) {
      try {
        const q = e.requestInfo().query;
        if (q && (q.cost_center_id || q.cost_center)) {
          const val = q.cost_center_id || q.cost_center;
          costCenterId = Array.isArray(val) ? val[0] : val;
        }
      } catch (_) {}
    }
  }
  if (costCenterId === "TODOS" || costCenterId === "TODAS" || costCenterId === "ALL" || costCenterId === "null") costCenterId = "";

  // Obtener advisor_id (vendedor)
  let advisorId = "";
  try {
    advisorId = e.queryParam("advisor_id") || "";
  } catch (_) {
    try {
      advisorId = e.QueryParam("advisor_id") || "";
    } catch (_) {
      try {
        const q = e.requestInfo().query;
        if (q && q.advisor_id) {
          advisorId = Array.isArray(q.advisor_id) ? q.advisor_id[0] : q.advisor_id;
        }
      } catch (_) {}
    }
  }

  try {
    // 2. Generar últimos 6 meses (YYYY-MM) y últimos 12 meses
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyymm = d.toISOString().slice(0, 7); // "YYYY-MM"
      months.push(yyyymm);
    }
    const months12 = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyymm = d.toISOString().slice(0, 7);
      months12.push(yyyymm);
    }
    const currentMonthStr  = months[5];
    const previousMonthStr = months[4];

    // Fecha de hoy (YYYY-MM-DD) — formato ISO compatible con SQLite
    const todayStr = now.getFullYear() + "-"
      + String(now.getMonth() + 1).padStart(2, "0") + "-"
      + String(now.getDate()).padStart(2, "0");

    // Rangos de fecha
    const startDate        = months[0] + "-01 00:00:00";
    const startDate12      = months12[0] + "-01 00:00:00";
    const endDate          = currentMonthStr + "-31 23:59:59";
    const currentMonthStart= currentMonthStr + "-01 00:00:00";
    const currentMonthEnd  = currentMonthStr + "-31 23:59:59";
    const prevMonthEnd     = previousMonthStr + "-31 23:59:59";

    // Condición de branch
    const bBranch = branchId ? " AND t.branch_id = {:branchId} " : "";
    const bBranchNoAlias = branchId ? " AND branch_id = {:branchId} " : "";

    // ════════════════════════════════════════════════════════════════
    //  BLOQUE CORE — KPIs operacionales (no financieros)
    // ════════════════════════════════════════════════════════════════

    // 3a. Conteos básicos del sistema
    const kpiSql = `
      SELECT
        (SELECT COUNT(*) FROM transactions t
          WHERE t.status = 'active'` + (branchId ? " AND t.branch_id = {:branchId}" : "") + `) AS totalTx,
        (SELECT COUNT(*) FROM third_parties WHERE active = 1) AS totalTp,
        (SELECT COUNT(*) FROM accounts WHERE active = 1) AS totalAc
    `;
    const kpiQuery = $app.db().newQuery(kpiSql);
    if (branchId) kpiQuery.bind({ branchId });
    const counts = new DynamicModel({ totalTx: 0, totalTp: 0, totalAc: 0 });
    kpiQuery.one(counts);

    // 3b. Conteos de transacciones por período (hoy / mes actual / mes anterior)
    const txPeriodSql = `
      SELECT
        COUNT(CASE WHEN strftime('%Y-%m-%d', t.date) = {:todayStr}    THEN 1 END) AS txToday,
        COUNT(CASE WHEN strftime('%Y-%m', t.date)    = {:curMon}      THEN 1 END) AS txThisMonth,
        COUNT(CASE WHEN strftime('%Y-%m', t.date)    = {:prevMon}     THEN 1 END) AS txPrevMonth
      FROM transactions t
      WHERE t.status = 'active'` + bBranch;

    const txPeriodQuery = $app.db().newQuery(txPeriodSql);
    txPeriodQuery.bind(Object.assign(
      { todayStr, curMon: currentMonthStr, prevMon: previousMonthStr },
      branchId ? { branchId } : {}
    ));
    const txPeriodResult = new DynamicModel({ txToday: 0, txThisMonth: 0, txPrevMonth: 0 });
    txPeriodQuery.one(txPeriodResult);

    // 3c. Nuevos terceros creados este mes
    // NOTA: se usa un bloque try/catch independiente porque no todas las
    // instalaciones exponen la columna 'created' en la tabla third_parties.
    let _newTpCount = 0;
    try {
      const newTpSql = `SELECT COUNT(*) AS cnt FROM third_parties WHERE created >= {:monthStart}`;
      const newTpQuery = $app.db().newQuery(newTpSql);
      newTpQuery.bind({ monthStart: currentMonthStart });
      const newTpResult = new DynamicModel({ cnt: 0 });
      newTpQuery.one(newTpResult);
      _newTpCount = Number(newTpResult.cnt) || 0;
    } catch (_) { /* columna 'created' no disponible — se omite */ }

    // 3d. Conteo mensual de transacciones — últimos 6 meses (para sparklines)
    const mTxCountSql = `
      SELECT strftime('%Y-%m', date) AS month, COUNT(*) AS txCount
      FROM transactions
      WHERE status = 'active' AND date >= {:startDate} AND date <= {:endDate}`
        + bBranchNoAlias + `
      GROUP BY strftime('%Y-%m', date)
    `;
    const mTxCountQuery = $app.db().newQuery(mTxCountSql);
    mTxCountQuery.bind(Object.assign({ startDate, endDate }, branchId ? { branchId } : {}));
    const mTxCountData = arrayOf(new DynamicModel({ month: "", txCount: 0 }));
    mTxCountQuery.all(mTxCountData);

    const monthlyTxCounts = new Array(6).fill(0);
    for (let i = 0; i < 6; i++) {
      const found = mTxCountData.find(d => d.month === months[i]);
      if (found) monthlyTxCounts[i] = Number(found.txCount) || 0;
    }

    // 3e. Distribución por tipo de documento — últimos 6 meses
    const txByTypeSql = `
      SELECT
        COALESCE(tt.name, 'Sin tipo') AS typeName,
        COUNT(*) AS txCount
      FROM transactions t
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      WHERE t.status = 'active' AND t.date >= {:startDate}` + bBranch + `
      GROUP BY t.tx_type_id
      ORDER BY txCount DESC
      LIMIT 8
    `;
    const txByTypeQuery = $app.db().newQuery(txByTypeSql);
    txByTypeQuery.bind(Object.assign({ startDate }, branchId ? { branchId } : {}));
    const txByTypeData = arrayOf(new DynamicModel({ typeName: "", txCount: 0 }));
    txByTypeQuery.all(txByTypeData);

    // 3f. Actividad reciente — últimas 10 transacciones (SIN montos financieros)
    // Ordenamos por t.date DESC (fecha contable) ya que 'created' no existe
    // en todas las instalaciones. Se agrega t.id DESC como desempate.
    const recentSql = `
      SELECT
        t.id,
        t.date,
        t.number AS consecutive,
        COALESCE(tt.name, 'Sin tipo') AS typeName,
        COALESCE(
          (SELECT COALESCE(NULLIF(TRIM(tp2.name),''), NULLIF(TRIM(tp2.business_name),''), '-')
           FROM tx_lines tl2
           LEFT JOIN third_parties tp2 ON tp2.id = tl2.third_party_id
           WHERE tl2.tx_id = t.id
             AND TRIM(COALESCE(tl2.third_party_id,'')) != ''
           LIMIT 1),
        '-') AS thirdParty
      FROM transactions t
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      WHERE t.status = 'active'` + bBranch + `
      ORDER BY t.date DESC, t.id DESC
      LIMIT 10
    `;
    const recentQuery = $app.db().newQuery(recentSql);
    if (branchId) recentQuery.bind({ branchId });
    const recentData = arrayOf(new DynamicModel({
      id: "", date: "", consecutive: "", typeName: "", thirdParty: ""
    }));
    recentQuery.all(recentData);

    // 3g. Obtener lista de vendedores (empleados activos)
    const sellersSql = `
      SELECT id, name
      FROM third_parties
      WHERE type = 'EMPLEADO' AND active = 1
      ORDER BY name ASC
    `;
    const sellersQuery = $app.db().newQuery(sellersSql);
    const sellersData = arrayOf(new DynamicModel({ id: "", name: "" }));
    sellersQuery.all(sellersData);

    // ════════════════════════════════════════════════════════════════
    //  BLOQUE CONTABILIDAD — KPIs financieros (módulo contabilidad)
    // ════════════════════════════════════════════════════════════════

    // 4. Calcular Activos (Clase 1) y Pasivos (Clase 2)
    const currentDateLimit = currentMonthStr + "-31 23:59:59";
    const prevDateLimit    = previousMonthStr + "-31 23:59:59";

    const balanceSql = `
      SELECT
        COALESCE(SUM(CASE WHEN a.code LIKE '1%' AND t.date <= {:currentLimit} THEN (l.debit - l.credit) ELSE 0 END), 0) AS currentActivos,
        COALESCE(SUM(CASE WHEN a.code LIKE '1%' AND t.date <= {:prevLimit}    THEN (l.debit - l.credit) ELSE 0 END), 0) AS prevActivos,
        COALESCE(SUM(CASE WHEN a.code LIKE '2%' AND t.date <= {:currentLimit} THEN (l.credit - l.debit) ELSE 0 END), 0) AS currentPasivos,
        COALESCE(SUM(CASE WHEN a.code LIKE '2%' AND t.date <= {:prevLimit}    THEN (l.credit - l.debit) ELSE 0 END), 0) AS prevPasivos
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active'` + bBranch;

    const balanceQuery = $app.db().newQuery(balanceSql);
    const bindBalance = { currentLimit: currentDateLimit, prevLimit: prevDateLimit };
    if (branchId) bindBalance.branchId = branchId;
    const balanceResult = new DynamicModel({
      currentActivos: -0, prevActivos: -0, currentPasivos: -0, prevPasivos: -0
    });
    try {
      balanceQuery.bind(bindBalance).one(balanceResult);
    } catch (_) {}

    // 5. Flujos mensuales Ingresos (Clase 4) y Gastos/Costos (Clases 5, 6, 7) — últimos 12 meses
    const monthlySql = `
      SELECT
        strftime('%Y-%m', t.date) AS month,
        SUM(CASE WHEN a.code LIKE '4%' THEN (l.credit - l.debit) ELSE 0 END) AS revenue,
        SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%'
                 THEN (l.debit - l.credit) ELSE 0 END) AS expense
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active' AND t.date >= {:startDate} AND t.date <= {:endDate}` + bBranch + `
      GROUP BY strftime('%Y-%m', t.date)
    `;
    const monthlyQuery = $app.db().newQuery(monthlySql);
    const bindMonthly = { startDate: startDate12, endDate };
    if (branchId) bindMonthly.branchId = branchId;
    const monthlyData = arrayOf(new DynamicModel({ month: "", revenue: -0, expense: -0 }));
    monthlyQuery.bind(bindMonthly).all(monthlyData);

    const monthlyRevenues = new Array(6).fill(0);
    const monthlyExpenses = new Array(6).fill(0);
    for (let i = 0; i < 6; i++) {
      const mStr  = months[i];
      const found = monthlyData.find(d => d.month === mStr);
      if (found) {
        monthlyRevenues[i] = Number(found.revenue) || 0;
        monthlyExpenses[i] = Number(found.expense) || 0;
      }
    }

    const monthlyRevenues12 = new Array(12).fill(0);
    const monthlyExpenses12 = new Array(12).fill(0);
    for (let i = 0; i < 12; i++) {
      const mStr  = months12[i];
      const found = monthlyData.find(d => d.month === mStr);
      if (found) {
        monthlyRevenues12[i] = Number(found.revenue) || 0;
        monthlyExpenses12[i] = Number(found.expense) || 0;
      }
    }

    // 5b. Flujos diarios del mes actual
    const dailyRevenues = new Array(31).fill(0);
    const dailyExpenses = new Array(31).fill(0);
    const dailySql = `
      SELECT
        strftime('%d', t.date) AS day,
        SUM(CASE WHEN a.code LIKE '4%' THEN (l.credit - l.debit) ELSE 0 END) AS revenue,
        SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%'
                 THEN (l.debit - l.credit) ELSE 0 END) AS expense
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active' AND t.date >= {:start} AND t.date <= {:end}` + bBranch + `
      GROUP BY strftime('%d', t.date)
    `;
    const dailyQuery = $app.db().newQuery(dailySql);
    const bindDaily = { start: currentMonthStart, end: currentMonthEnd };
    if (branchId) bindDaily.branchId = branchId;
    const dailyData = arrayOf(new DynamicModel({ day: "", revenue: -0, expense: -0 }));
    dailyQuery.bind(bindDaily).all(dailyData);

    for (const row of dailyData) {
      const dayIdx = parseInt(row.day, 10) - 1;
      if (dayIdx >= 0 && dayIdx < 31) {
        dailyRevenues[dayIdx] = Number(row.revenue) || 0;
        dailyExpenses[dayIdx] = Number(row.expense) || 0;
      }
    }

    // 6. Clasificar gastos del mes actual para gráfico de dona
    const expensesByCategory = {
      'Nómina y Personal': 0, 'Servicios y Honorarios': 0, 'Impuestos': 0,
      'Costos de Ventas': 0, 'Compras y Materia Prima': 0,
      'Gastos Financieros': 0, 'Otros Gastos': 0,
    };
    const categorySql = `
      SELECT a.code, SUM(l.debit - l.credit) AS balance
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active'
        AND (a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%')
        AND t.date >= {:start} AND t.date <= {:end}` + bBranch + `
      GROUP BY a.code
    `;
    const categoryQuery = $app.db().newQuery(categorySql);
    const bindCategory = { start: currentMonthStart, end: currentMonthEnd };
    if (branchId) bindCategory.branchId = branchId;
    const categoryData = arrayOf(new DynamicModel({ code: "", balance: -0 }));
    categoryQuery.bind(bindCategory).all(categoryData);

    for (const row of categoryData) {
      const code = row.code;
      const bal  = Number(row.balance) || 0;
      let cat = 'Otros Gastos';
      if      (code.startsWith('5105') || code.startsWith('5205')) cat = 'Nómina y Personal';
      else if (code.startsWith('5135') || code.startsWith('5235') || code.startsWith('5110') || code.startsWith('5230')) cat = 'Servicios y Honorarios';
      else if (code.startsWith('5115') || code.startsWith('5215')) cat = 'Impuestos';
      else if (code.startsWith('61'))  cat = 'Costos de Ventas';
      else if (code.startsWith('62'))  cat = 'Compras y Materia Prima';
      else if (code.startsWith('53'))  cat = 'Gastos Financieros';
      expensesByCategory[cat] += bal;
    }

    // 7. Inventario Valorizado
    const invByCategory = {};
    const stockSql = `
      SELECT
        COALESCE(NULLIF(TRIM(p.categoria), ''), 'Sin Categoría') AS category,
        SUM(s.qty_on_hand * COALESCE(
          CASE WHEN s.avg_cost > 0 THEN s.avg_cost ELSE NULL END,
          CASE WHEN p.cost_price > 0 THEN p.cost_price ELSE 0 END,
          0
        )) AS val
      FROM inventory_stock s
      INNER JOIN products p ON p.id = s.product_id
      WHERE s.qty_on_hand != 0
      GROUP BY COALESCE(NULLIF(TRIM(p.categoria), ''), 'Sin Categoría')
    `;
    const stockData = arrayOf(new DynamicModel({ category: "", val: -0 }));
    $app.db().newQuery(stockSql).all(stockData);
    for (const row of stockData) {
      invByCategory[row.category] = Number(row.val) || 0;
    }

    // 7b. Detalle de stock agrupado por Categoría y Línea para KPI dinámico
    const stockDetailsSql = `
      SELECT
        COALESCE(NULLIF(TRIM(p.categoria), ''), 'Sin Categoría') AS category,
        COALESCE(NULLIF(TRIM(p.linea), ''), 'Sin Línea') AS line,
        COUNT(DISTINCT p.id) AS itemsCount,
        SUM(s.qty_on_hand) AS totalQty,
        SUM(s.qty_on_hand * COALESCE(
          CASE WHEN s.avg_cost > 0 THEN s.avg_cost ELSE NULL END,
          CASE WHEN p.cost_price > 0 THEN p.cost_price ELSE 0 END,
          0
        )) AS totalVal
      FROM inventory_stock s
      INNER JOIN products p ON p.id = s.product_id
      WHERE s.qty_on_hand != 0
      GROUP BY 
        COALESCE(NULLIF(TRIM(p.categoria), ''), 'Sin Categoría'),
        COALESCE(NULLIF(TRIM(p.linea), ''), 'Sin Línea')
    `;
    const stockDetailsQuery = $app.db().newQuery(stockDetailsSql);
    const stockDetailsData = arrayOf(new DynamicModel({ category: "", line: "", itemsCount: 0, totalQty: -0, totalVal: -0 }));
    stockDetailsQuery.all(stockDetailsData);

    // 8. Cartera por Edades (Buckets) — Filtrado opcionalmente por vendedor
    const invoiceSql = `
      SELECT
        l.third_party_id AS thirdPartyId,
        l.cross_doc_ref  AS crossDocRef,
        MIN(t.date)                        AS docDate,
        MAX(COALESCE(t.payment_days, 0))   AS paymentDays,
        SUM(l.debit - l.credit)            AS openBalance
      FROM tx_lines l
      INNER JOIN accounts a ON a.id = l.account_id
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN third_parties tp ON tp.id = l.third_party_id
      WHERE t.status = 'active'
        AND a.maneja_cruce = 1
        AND a.nature = 'debit'
        AND TRIM(COALESCE(l.cross_doc_ref, '')) != ''`
        + bBranch
        + (advisorId ? " AND tp.advisor = {:advisorId} " : "") + `
      GROUP BY l.third_party_id, l.cross_doc_ref
      HAVING openBalance > 0.0001
    `;
    const invoiceQuery = $app.db().newQuery(invoiceSql);
    const bindInvoice = {};
    if (branchId) bindInvoice.branchId = branchId;
    if (advisorId) bindInvoice.advisorId = advisorId;
    if (branchId || advisorId) {
      invoiceQuery.bind(bindInvoice);
    }
    const openInvoices = arrayOf(new DynamicModel({
      thirdPartyId: "", crossDocRef: "", docDate: "", paymentDays: 0, openBalance: -0
    }));
    invoiceQuery.all(openInvoices);

    let carteraPorVencer = 0, cartera0_30 = 0, cartera31_60 = 0, cartera61_90 = 0, carteraMayor90 = 0;
    const asOfDate = new Date();
    asOfDate.setHours(0, 0, 0, 0);
    const asOfTime = asOfDate.getTime();

    for (const doc of openInvoices) {
      const openBal     = Number(doc.openBalance) || 0;
      const dateOnly    = String(doc.docDate).split(" ")[0];
      const from        = new Date(dateOnly + "T00:00:00");
      const paymentDays = Number(doc.paymentDays) || 0;
      const due         = new Date(from.getTime() + (paymentDays * 86400000));
      const expiredDays = Math.floor((asOfTime - due.getTime()) / 86400000);

      if      (expiredDays < 0)   carteraPorVencer += openBal;
      else if (expiredDays <= 30) cartera0_30      += openBal;
      else if (expiredDays <= 60) cartera31_60     += openBal;
      else if (expiredDays <= 90) cartera61_90     += openBal;
      else                        carteraMayor90   += openBal;
    }

    // 9. Retornar el JSON estructurado
    return e.json(200, {
      // ── CORE: operacional ────────────────────────────────────────
      kpis: {
        totalTx:        Number(counts.totalTx)             || 0,
        totalTp:        Number(counts.totalTp)             || 0,
        totalAc:        Number(counts.totalAc)             || 0,
        txToday:        Number(txPeriodResult.txToday)     || 0,
        txThisMonth:    Number(txPeriodResult.txThisMonth) || 0,
        txPrevMonth:    Number(txPeriodResult.txPrevMonth) || 0,
        newTpThisMonth: _newTpCount,
      },
      monthlyTxCounts: monthlyTxCounts,
      txByType:        txByTypeData.map(d => ({ typeName: d.typeName, txCount: Number(d.txCount) || 0 })),
      recentActivity:  recentData.map(d => ({
        id: d.id, date: d.date, consecutive: d.consecutive,
        typeName: d.typeName, thirdParty: d.thirdParty,
      })),
      monthsLabels: months,
      months12Labels: months12,
      monthlyRevenues12: monthlyRevenues12,
      monthlyExpenses12: monthlyExpenses12,
      dailyRevenues: dailyRevenues,
      dailyExpenses: dailyExpenses,
      sellers:      sellersData.map(s => ({ id: s.id, name: s.name })),
      stockDetails: stockDetailsData.map(r => ({
        category: r.category,
        line: r.line,
        itemsCount: Number(r.itemsCount) || 0,
        totalQty: Number(r.totalQty) || 0,
        totalVal: Number(r.totalVal) || 0
      })),

      // ── CONTABILIDAD: financiero ─────────────────────────────────
      currentMonthActivos:  Number(balanceResult.currentActivos) || 0,
      prevMonthActivos:     Number(balanceResult.prevActivos)    || 0,
      currentMonthPasivos:  Number(balanceResult.currentPasivos) || 0,
      prevMonthPasivos:     Number(balanceResult.prevPasivos)    || 0,
      monthlyRevenues:      monthlyRevenues,
      monthlyExpenses:      monthlyExpenses,
      expensesByCategory:   expensesByCategory,
      invByCategory:        invByCategory,
      carteraBuckets: {
        porVencer: carteraPorVencer,
        c0_30:     cartera0_30,
        c31_60:    cartera31_60,
        c61_90:    cartera61_90,
        cMayor90:  carteraMayor90,
      },
    });

  } catch (err) {
    return e.json(500, { error: "Error interno agregando el dashboard: " + err.message });
  }
});

/**
 * Endpoint: GET /api/gravy/account-saldos
 * Devuelve los saldos acumulados de todas las cuentas agrupadas
 * directamente por SQLite, reduciendo la transferencia de datos en reportes.
 */
routerAdd("GET", "/api/gravy/account-saldos", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { error: "No autorizado" });
  }

  // Obtener period de forma robusta y compatible en Echo/Goja
  let period = "";
  try {
    period = e.queryParam("period") || "";
  } catch (_) {
    try {
      period = e.QueryParam("period") || "";
    } catch (_) {
      try {
        const q = e.requestInfo().query;
        if (q && q.period) {
          period = Array.isArray(q.period) ? q.period[0] : q.period;
        }
      } catch (_) {}
    }
  }

  try {
    let sql = `
      SELECT
        l.account_id AS accountId,
        SUM(l.debit - l.credit) AS balance
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      WHERE t.status = 'active'
    `;

    const bindParams = {};
    if (period && /^\d{4}-\d{2}$/.test(period)) {
      const [yearStr, monthStr] = period.split('-');
      const year  = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
      let nextYear  = year;
      let nextMonth = month + 1;
      if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;
      sql += " AND t.date >= {:start} AND t.date < {:end}";
      bindParams.start = startDate;
      bindParams.end   = endDate;
    }

    sql += " GROUP BY l.account_id";

    const query = $app.db().newQuery(sql);
    if (period && /^\d{4}-\d{2}$/.test(period)) {
      query.bind(bindParams);
    }
    const data = arrayOf(new DynamicModel({ accountId: "", balance: -0 }));
    query.all(data);

    const saldos = {};
    for (const row of data) {
      saldos[row.accountId] = Number(row.balance) || 0;
    }

    return e.json(200, saldos);
  } catch (err) {
    return e.json(500, { error: "Error en saldo de cuentas: " + err.message });
  }
});
