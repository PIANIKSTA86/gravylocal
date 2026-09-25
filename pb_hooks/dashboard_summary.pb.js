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

    // 8. Cartera de Clientes (CxC) — Alineado exactamente con el reporte oficial report-portfolio-aging
    let carteraTotal = 0;
    let carteraVencida = 0;
    let carteraPorVencer = 0, cartera0_30 = 0, cartera31_60 = 0, cartera61_90 = 0, carteraMayor90 = 0;
    const asOfLimit = todayStr + " 23:59:59";
    const asOfTime = new Date(todayStr + "T00:00:00").getTime();

    try {
      let cxcSql = `
        SELECT
          l.account_id,
          l.third_party_id,
          COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') AS crossDocRef,
          a.nature AS accNature,
          MIN(COALESCE(NULLIF(TRIM(l.due_date), ''), '')) AS lineDueDate,
          MIN(COALESCE(NULLIF(TRIM(l.cross_doc_date), ''), t.date)) AS docDate,
          MAX(COALESCE(t.payment_days, tp.payment_days, 0)) AS paymentDays,
          SUM(l.debit) AS totDebit,
          SUM(l.credit) AS totCredit
        FROM tx_lines l
        INNER JOIN accounts a ON a.id = l.account_id
        INNER JOIN transactions t ON t.id = l.tx_id
        LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
        WHERE t.status = 'active'
          AND t.date <= {:asOfLimit}
          AND a.code LIKE '13%'
          AND (a.maneja_cruce = 1 OR TRIM(COALESCE(l.cross_doc_ref, '')) != '')
          AND UPPER(COALESCE(tp.type, '')) = 'CLIENTE'`
          + bBranch
          + (advisorId ? " AND tp.advisor = {:advisorId} " : "")
          + (costCenterId ? " AND l.cost_center_id = {:costCenterId} " : "") + `
        GROUP BY l.account_id, l.third_party_id, crossDocRef
      `;
      const cxcQuery = $app.db().newQuery(cxcSql);
      const cxcBinds = { asOfLimit };
      if (branchId) cxcBinds.branchId = branchId;
      if (advisorId) cxcBinds.advisorId = advisorId;
      if (costCenterId) cxcBinds.costCenterId = costCenterId;
      cxcQuery.bind(cxcBinds);

      const cxcData = arrayOf(new DynamicModel({
        account_id: "", third_party_id: "", crossDocRef: "", accNature: "",
        lineDueDate: "", docDate: "", paymentDays: 0, totDebit: -0, totCredit: -0
      }));
      cxcQuery.all(cxcData);

      for (let i = 0; i < cxcData.length; i++) {
        const doc = cxcData[i];
        const nature = String(doc.accNature || 'debit').toLowerCase();
        const deb = Number(doc.totDebit) || 0;
        const cred = Number(doc.totCredit) || 0;
        const openBal = nature === 'debit' ? (deb - cred) : (cred - deb);

        if (Math.abs(openBal) <= 0.0001) continue;

        carteraTotal += openBal;

        const lineDue = String(doc.lineDueDate || '').trim();
        const dateOnly = String(doc.docDate || '').split(" ")[0] || todayStr;
        const pDays = Number(doc.paymentDays) || 0;

        let dueTime = 0;
        if (lineDue) {
          dueTime = new Date(lineDue.split(" ")[0] + "T00:00:00").getTime();
        } else {
          dueTime = new Date(dateOnly + "T00:00:00").getTime() + (pDays * 86400000);
        }

        const expiredDays = Math.floor((asOfTime - dueTime) / 86400000);

        if (openBal < 0) {
          // Saldo a favor (anticipo / nota crédito)
        } else if (expiredDays < 0) {
          carteraPorVencer += openBal;
        } else {
          carteraVencida += openBal;
          if (expiredDays <= 30)      cartera0_30 += openBal;
          else if (expiredDays <= 60) cartera31_60 += openBal;
          else if (expiredDays <= 90) cartera61_90 += openBal;
          else                        carteraMayor90 += openBal;
        }
      }
    } catch (_) {}

    // 8b. Cuentas por Pagar (CxP) Proveedores — Exactamente igual a /api/gravy/report-portfolio-aging
    let cxpTotal = 0;
    let cxpWeek = 0;
    try {
      let cxpSql = `
        SELECT
          l.account_id,
          l.third_party_id,
          COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') AS crossDocRef,
          a.nature AS accNature,
          MIN(COALESCE(NULLIF(TRIM(l.due_date), ''), '')) AS lineDueDate,
          MIN(COALESCE(NULLIF(TRIM(l.cross_doc_date), ''), t.date)) AS docDate,
          MAX(COALESCE(t.payment_days, tp.payment_days, 0)) AS paymentDays,
          SUM(l.debit) AS totDebit,
          SUM(l.credit) AS totCredit
        FROM tx_lines l
        INNER JOIN accounts a ON a.id = l.account_id
        INNER JOIN transactions t ON t.id = l.tx_id
        LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
        WHERE t.status = 'active'
          AND t.date <= {:asOfLimit}
          AND (a.code LIKE '22%' OR a.code LIKE '23%' OR a.code LIKE '25%')
          AND (a.maneja_cruce = 1 OR TRIM(COALESCE(l.cross_doc_ref, '')) != '')
          AND UPPER(COALESCE(tp.type, '')) = 'PROVEEDOR'`
          + bBranch
          + (costCenterId ? " AND l.cost_center_id = {:costCenterId} " : "") + `
        GROUP BY l.account_id, l.third_party_id, crossDocRef
      `;
      const cxpQuery = $app.db().newQuery(cxpSql);
      const cxpBinds = { asOfLimit };
      if (branchId) cxpBinds.branchId = branchId;
      if (costCenterId) cxpBinds.costCenterId = costCenterId;
      cxpQuery.bind(cxpBinds);

      const cxpData = arrayOf(new DynamicModel({
        account_id: "", third_party_id: "", crossDocRef: "", accNature: "",
        lineDueDate: "", docDate: "", paymentDays: 0, totDebit: -0, totCredit: -0
      }));
      cxpQuery.all(cxpData);

      const in7DaysTime = asOfTime + (7 * 86400000);
      let saldoAFavorCxp = 0;
      let cxpWeekBruto = 0;

      for (let i = 0; i < cxpData.length; i++) {
        const doc = cxpData[i];
        const nature = String(doc.accNature || 'credit').toLowerCase();
        const deb = Number(doc.totDebit) || 0;
        const cred = Number(doc.totCredit) || 0;
        const openBal = nature === 'credit' ? (cred - deb) : (deb - cred);

        if (Math.abs(openBal) <= 0.0001) continue;

        cxpTotal += openBal;

        const lineDue = String(doc.lineDueDate || '').trim();
        const dateOnly = String(doc.docDate || '').split(" ")[0] || todayStr;
        const pDays = Number(doc.paymentDays) || 0;

        let dueTime = 0;
        if (lineDue) {
          dueTime = new Date(lineDue.split(" ")[0] + "T00:00:00").getTime();
        } else {
          dueTime = new Date(dateOnly + "T00:00:00").getTime() + (pDays * 86400000);
        }

        if (openBal < 0) {
          saldoAFavorCxp += openBal;
        } else if (dueTime <= in7DaysTime) {
          cxpWeekBruto += openBal;
        }
      }
      // Compensar neto con saldo a favor de proveedores
      cxpWeek = Math.min(cxpTotal, Math.max(0, cxpWeekBruto + saldoAFavorCxp));
    } catch (_) {}

    // 8c. Liquidez disponible en Caja y Bancos (Cuentas 11%)
    let totalLiquidez = 0;
    try {
      const liqSql = `
        SELECT COALESCE(SUM(l.debit - l.credit), 0) AS totalLiquidez
        FROM tx_lines l
        INNER JOIN accounts a ON a.id = l.account_id
        INNER JOIN transactions t ON t.id = l.tx_id
        WHERE t.status = 'active' AND a.code LIKE '11%'` + bBranch;
      const liqQuery = $app.db().newQuery(liqSql);
      if (branchId) liqQuery.bind({ branchId });
      const liqRes = new DynamicModel({ totalLiquidez: -0 });
      liqQuery.one(liqRes);
      totalLiquidez = Number(liqRes.totalLiquidez) || 0;
    } catch (_) {}

    // 8d. Métricas Fiscales: Estimación de IVA (2408/2335) y Retenciones (2365/2367/2368)
    let ivaGenerado = 0;
    let ivaDescontable = 0;
    let retencionesMes = 0;
    try {
      const impSql = `
        SELECT
          COALESCE(SUM(CASE WHEN (a.code LIKE '240801%' OR a.code LIKE '233501%') THEN (l.credit - l.debit)
                            WHEN a.code LIKE '2408%' AND l.credit > l.debit THEN (l.credit - l.debit)
                            ELSE 0 END), 0) AS ivaGen,
          COALESCE(SUM(CASE WHEN (a.code LIKE '240802%' OR a.code LIKE '233502%') THEN (l.debit - l.credit)
                            WHEN a.code LIKE '2408%' AND l.debit > l.credit THEN (l.debit - l.credit)
                            ELSE 0 END), 0) AS ivaDesc,
          COALESCE(SUM(CASE WHEN (a.code LIKE '2365%' OR a.code LIKE '2367%' OR a.code LIKE '2368%') THEN (l.credit - l.debit)
                            ELSE 0 END), 0) AS retMes
        FROM tx_lines l
        INNER JOIN accounts a ON a.id = l.account_id
        INNER JOIN transactions t ON t.id = l.tx_id
        WHERE t.status = 'active' AND t.date >= {:start} AND t.date <= {:end}` + bBranch;
      const impQuery = $app.db().newQuery(impSql);
      const impBind = { start: currentMonthStart, end: currentMonthEnd };
      if (branchId) impBind.branchId = branchId;
      const impRes = new DynamicModel({ ivaGen: -0, ivaDesc: -0, retMes: -0 });
      impQuery.bind(impBind).one(impRes);
      ivaGenerado = Number(impRes.ivaGen) || 0;
      ivaDescontable = Number(impRes.ivaDesc) || 0;
      retencionesMes = Number(impRes.retMes) || 0;
    } catch (_) {}

    // 8e. Métricas de Inventario: Quiebres de stock, stock negativo y movimientos
    let criticalStockCount = 0;
    let negativeStockCount = 0;
    let totalInvMovs = 0;
    const topCriticalProds = [];
    try {
      const invMetSql = `
        SELECT
          (SELECT COUNT(DISTINCT s.product_id)
           FROM inventory_stock s
           INNER JOIN products p ON p.id = s.product_id
           WHERE p.active = 1 AND p.stock_min > 0 AND s.qty_on_hand <= p.stock_min) AS critCount,
          (SELECT COUNT(DISTINCT product_id)
           FROM inventory_stock
           WHERE qty_on_hand < 0) AS negCount,
          (SELECT COUNT(*)
           FROM inventory_movements
           WHERE status != 'voided' AND date >= {:start} AND date <= {:end}` + (branchId ? " AND branch_id = {:branchId}" : "") + `) AS movCount
      `;
      const invMetQuery = $app.db().newQuery(invMetSql);
      const invMetBind = { start: currentMonthStart, end: currentMonthEnd };
      if (branchId) invMetBind.branchId = branchId;
      const invMetRes = new DynamicModel({ critCount: 0, negCount: 0, movCount: 0 });
      invMetQuery.bind(invMetBind).one(invMetRes);
      criticalStockCount = Number(invMetRes.critCount) || 0;
      negativeStockCount = Number(invMetRes.negCount) || 0;
      totalInvMovs = Number(invMetRes.movCount) || 0;

      // Top 5 productos más críticos
      const topCritSql = `
        SELECT p.code, p.name, COALESCE(p.stock_min, 0) AS stockMin, SUM(s.qty_on_hand) AS qtyOnHand
        FROM inventory_stock s
        INNER JOIN products p ON p.id = s.product_id
        WHERE p.active = 1 AND p.stock_min > 0
        GROUP BY p.id
        HAVING qtyOnHand <= stockMin
        ORDER BY (stockMin - qtyOnHand) DESC
        LIMIT 5
      `;
      const topCritQuery = $app.db().newQuery(topCritSql);
      const topCritData = arrayOf(new DynamicModel({ code: "", name: "", stockMin: -0, qtyOnHand: -0 }));
      topCritQuery.all(topCritData);
      for (const p of topCritData) {
        topCriticalProds.push({
          code: p.code,
          name: p.name,
          stockMin: Number(p.stockMin) || 0,
          qtyOnHand: Number(p.qtyOnHand) || 0
        });
      }
    } catch (_) {}

    // 8f. Auditoría y Comprobantes en Borrador
    let draftTxCount = 0;
    try {
      const draftSql = `SELECT COUNT(*) AS draftCount FROM transactions WHERE status = 'draft'` + (branchId ? " AND branch_id = {:branchId}" : "");
      const draftQuery = $app.db().newQuery(draftSql);
      if (branchId) draftQuery.bind({ branchId });
      const draftRes = new DynamicModel({ draftCount: 0 });
      draftQuery.one(draftRes);
      draftTxCount = Number(draftRes.draftCount) || 0;
    } catch (_) {}

    // 8g. MÓDULO A: Nómina y Recursos Humanos
    let activeEmployeesCount = 0;
    let payrollCostMonth = 0;
    let payrollPendingDian = 0;
    let currentPayrollStatus = 'Sin Período';
    try {
      const empSql = `SELECT COUNT(*) AS cnt FROM third_parties WHERE type = 'EMPLEADO' AND active = 1`;
      const empRes = new DynamicModel({ cnt: 0 });
      $app.db().newQuery(empSql).one(empRes);
      activeEmployeesCount = Number(empRes.cnt) || 0;

      const payPerSql = `
        SELECT id, name, status, start_date, end_date
        FROM payroll_periods
        WHERE (start_date <= {:end} AND end_date >= {:start}) OR (created >= {:start})
        ORDER BY start_date DESC
        LIMIT 1
      `;
      const payPerQuery = $app.db().newQuery(payPerSql);
      payPerQuery.bind({ start: currentMonthStart, end: currentMonthEnd });
      const payPerRes = new DynamicModel({ id: "", name: "", status: "", start_date: "", end_date: "" });
      try {
        payPerQuery.one(payPerRes);
        currentPayrollStatus = payPerRes.status || 'Borrador';
        if (payPerRes.id) {
          const linesSql = `SELECT COALESCE(SUM(total_neto), 0) AS totalCost FROM payroll_lines WHERE period_id = {:pid}`;
          const linesRes = new DynamicModel({ totalCost: -0 });
          $app.db().newQuery(linesSql).bind({ pid: payPerRes.id }).one(linesRes);
          payrollCostMonth = Number(linesRes.totalCost) || 0;
        }
      } catch (_) {}

      const pendDianSql = `SELECT COUNT(*) AS cnt FROM payroll_periods WHERE status = 'approved' AND (tx_id = '' OR tx_id IS NULL)`;
      const pendDianRes = new DynamicModel({ cnt: 0 });
      $app.db().newQuery(pendDianSql).one(pendDianRes);
      payrollPendingDian = Number(pendDianRes.cnt) || 0;
    } catch (_) {}

    // 8h. MÓDULO B: Facturación Electrónica y Resoluciones DIAN
    let dianResolutionsExpiring = 0;
    let dianDocsRejected = 0;
    let dianDocSoporteMonth = 0;
    let dianSuccessRate = 100;
    try {
      const thirtyDaysAhead = new Date(asOfTime + (30 * 86400000)).toISOString().slice(0, 10);
      const resSql = `
        SELECT COUNT(*) AS cnt
        FROM dian_resolutions
        WHERE active = 1
          AND (valid_to <= {:limitDate} OR (to_number - current_number) <= 100)
      `;
      const resQuery = $app.db().newQuery(resSql);
      resQuery.bind({ limitDate: thirtyDaysAhead });
      const resModel = new DynamicModel({ cnt: 0 });
      try {
        resQuery.one(resModel);
        dianResolutionsExpiring = Number(resModel.cnt) || 0;
      } catch (_) {}

      const rejSql = `SELECT COUNT(*) AS cnt FROM einvoice_docs WHERE status IN ('rechazada', 'error')`;
      const rejRes = new DynamicModel({ cnt: 0 });
      try {
        $app.db().newQuery(rejSql).one(rejRes);
        dianDocsRejected = Number(rejRes.cnt) || 0;
      } catch (_) {}

      const totalDocsSql = `
        SELECT
          COUNT(CASE WHEN status = 'aceptada' THEN 1 END) AS accepted,
          COUNT(*) AS total
        FROM einvoice_docs
      `;
      const totalDocsRes = new DynamicModel({ accepted: 0, total: 0 });
      try {
        $app.db().newQuery(totalDocsSql).one(totalDocsRes);
        const totDian = Number(totalDocsRes.total) || 0;
        const accDian = Number(totalDocsRes.accepted) || 0;
        if (totDian > 0) {
          dianSuccessRate = Math.round((accDian / totDian) * 100);
        }
      } catch (_) {}

      const docSopSql = `
        SELECT COALESCE(SUM(total), 0) AS totalVal
        FROM support_documents
        WHERE date >= {:start} AND date <= {:end}` + (branchId ? " AND branch_id = {:branchId}" : "");
      const docSopQuery = $app.db().newQuery(docSopSql);
      const docSopBind = { start: currentMonthStart, end: currentMonthEnd };
      if (branchId) docSopBind.branchId = branchId;
      const docSopRes = new DynamicModel({ totalVal: -0 });
      try {
        docSopQuery.bind(docSopBind).one(docSopRes);
        dianDocSoporteMonth = Number(docSopRes.totalVal) || 0;
      } catch (_) {}
    } catch (_) {}

    // 8i. MÓDULO C: Punto de Venta (POS)
    let posSalesToday = 0;
    let posTicketsCount = 0;
    let posOpenShiftsCount = 0;
    const posPaymentMethods = { 'Efectivo': 0, 'Tarjeta / Datáfono': 0, 'Transferencia': 0, 'Crédito': 0 };
    try {
      const shiftsSql = `SELECT COUNT(*) AS cnt FROM pos_shifts WHERE status = 'open'`;
      const shiftsRes = new DynamicModel({ cnt: 0 });
      try {
        $app.db().newQuery(shiftsSql).one(shiftsRes);
        posOpenShiftsCount = Number(shiftsRes.cnt) || 0;
      } catch (_) {}

      const posTodaySql = `
        SELECT
          COUNT(*) AS ticketsCount,
          COALESCE(SUM(total), 0) AS totalSales,
          COALESCE(SUM(CASE WHEN payment_method IN ('EFECTIVO', 'CASH', 'Efectivo') THEN total ELSE 0 END), 0) AS mCash,
          COALESCE(SUM(CASE WHEN payment_method IN ('TARJETA', 'DATAFONO', 'CARD', 'Tarjeta') THEN total ELSE 0 END), 0) AS mCard,
          COALESCE(SUM(CASE WHEN payment_method IN ('TRANSFERENCIA', 'NEQUI', 'DAVIPLATA', 'BANCO') THEN total ELSE 0 END), 0) AS mTransfer,
          COALESCE(SUM(CASE WHEN payment_method IN ('CREDITO', 'CREDIT') THEN total ELSE 0 END), 0) AS mCredit
        FROM invoices
        WHERE (is_pos = 1 OR doc_type = 'POS' OR pos_register_id != '')
          AND status != 'voided'
          AND strftime('%Y-%m-%d', date) = {:todayStr}` + (branchId ? " AND branch_id = {:branchId}" : "");
      const posTodayQuery = $app.db().newQuery(posTodaySql);
      const posBind = { todayStr };
      if (branchId) posBind.branchId = branchId;
      const posRes = new DynamicModel({ ticketsCount: 0, totalSales: -0, mCash: -0, mCard: -0, mTransfer: -0, mCredit: -0 });
      try {
        posTodayQuery.bind(posBind).one(posRes);
        posSalesToday = Number(posRes.totalSales) || 0;
        posTicketsCount = Number(posRes.ticketsCount) || 0;
        posPaymentMethods['Efectivo'] = Number(posRes.mCash) || 0;
        posPaymentMethods['Tarjeta / Datáfono'] = Number(posRes.mCard) || 0;
        posPaymentMethods['Transferencia'] = Number(posRes.mTransfer) || 0;
        posPaymentMethods['Crédito'] = Number(posRes.mCredit) || 0;
      } catch (_) {}
    } catch (_) {}
    const posAvgTicket = posTicketsCount > 0 ? (posSalesToday / posTicketsCount) : 0;

    // 8j. MÓDULO D: Compras y Órdenes de Compra
    let purchasesThisMonth = 0;
    let purchasesPrevMonth = 0;
    let pendingPurchaseOrders = 0;
    const topSuppliers = [];
    try {
      const purPeriodSql = `
        SELECT
          COALESCE(SUM(CASE WHEN strftime('%Y-%m', date) = {:curMon} THEN total ELSE 0 END), 0) AS pThisMonth,
          COALESCE(SUM(CASE WHEN strftime('%Y-%m', date) = {:prevMon} THEN total ELSE 0 END), 0) AS pPrevMonth
        FROM purchase_invoices
        WHERE status != 'voided'` + (branchId ? " AND branch_id = {:branchId}" : "");
      const purPeriodQuery = $app.db().newQuery(purPeriodSql);
      const purBind = { curMon: currentMonthStr, prevMon: previousMonthStr };
      if (branchId) purBind.branchId = branchId;
      const purRes = new DynamicModel({ pThisMonth: -0, pPrevMonth: -0 });
      try {
        purPeriodQuery.bind(purBind).one(purRes);
        purchasesThisMonth = Number(purRes.pThisMonth) || 0;
        purchasesPrevMonth = Number(purRes.pPrevMonth) || 0;
      } catch (_) {}

      const poSql = `SELECT COUNT(*) AS cnt FROM purchase_orders WHERE status IN ('approved', 'pending', 'abierta')` + (branchId ? " AND branch_id = {:branchId}" : "");
      const poQuery = $app.db().newQuery(poSql);
      if (branchId) poQuery.bind({ branchId });
      const poRes = new DynamicModel({ cnt: 0 });
      try {
        poQuery.one(poRes);
        pendingPurchaseOrders = Number(poRes.cnt) || 0;
      } catch (_) {}

      const topSuppSql = `
        SELECT
          COALESCE(NULLIF(TRIM(tp.name),''), 'Proveedor') AS suppName,
          SUM(pi.total) AS totalBought
        FROM purchase_invoices pi
        LEFT JOIN third_parties tp ON tp.id = pi.third_party_id
        WHERE pi.status != 'voided' AND pi.date >= {:startDate}` + (branchId ? " AND pi.branch_id = {:branchId}" : "") + `
        GROUP BY pi.third_party_id
        ORDER BY totalBought DESC
        LIMIT 5
      `;
      const topSuppQuery = $app.db().newQuery(topSuppSql);
      const topSuppBind = { startDate };
      if (branchId) topSuppBind.branchId = branchId;
      const topSuppData = arrayOf(new DynamicModel({ suppName: "", totalBought: -0 }));
      try {
        topSuppQuery.bind(topSuppBind).all(topSuppData);
        for (const s of topSuppData) {
          topSuppliers.push({
            name: s.suppName,
            total: Number(s.totalBought) || 0
          });
        }
      } catch (_) {}
    } catch (_) {}

    // 8k. MÓDULO G: Comercio Exterior e Importaciones
    let importsInTransitCount = 0;
    let importsValueTransit = 0;
    let importsPendingKardex = 0;
    try {
      const impTransitSql = `
        SELECT
          COUNT(*) AS cnt,
          COALESCE(SUM(COALESCE(total_fob, total, 0)), 0) AS valFob
        FROM imports
        WHERE status IN ('en_transito', 'cotizacion', 'puerto', 'aduana')
      `;
      const impRes = new DynamicModel({ cnt: 0, valFob: -0 });
      try {
        $app.db().newQuery(impTransitSql).one(impRes);
        importsInTransitCount = Number(impRes.cnt) || 0;
        importsValueTransit = Number(impRes.valFob) || 0;
      } catch (_) {}

      const impKardexSql = `SELECT COUNT(*) AS cnt FROM imports WHERE status = 'nacionalizado'`;
      const impKardexRes = new DynamicModel({ cnt: 0 });
      try {
        $app.db().newQuery(impKardexSql).one(impKardexRes);
        importsPendingKardex = Number(impKardexRes.cnt) || 0;
      } catch (_) {}
    } catch (_) {}

    // Razón corriente y Utilidad del mes
    const currentRev = monthlyRevenues[5] || 0;
    const currentExp = monthlyExpenses[5] || 0;
    const utilidadMes = currentRev - currentExp;
    const prevRev = monthlyRevenues[4] || 0;
    const activosVal = Number(balanceResult.currentActivos) || 0;
    const pasivosVal = Number(balanceResult.currentPasivos) || 0;
    const razonCorriente = pasivosVal > 0 ? (activosVal / pasivosVal) : (activosVal > 0 ? 1 : 0);

    // Suma de valor total de inventario
    let totalStockVal = 0;
    for (const catVal of Object.values(invByCategory)) {
      totalStockVal += Number(catVal) || 0;
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
        // Métricas extendidas para perfiles
        totalLiquidez:       totalLiquidez,
        cxpTotal:            cxpTotal,
        cxpWeek:             cxpWeek,
        carteraTotal:        carteraTotal,
        carteraVencida:      carteraVencida,
        ventasMes:           currentRev,
        ventasMesPrev:       prevRev,
        utilidadMes:         utilidadMes,
        razonCorriente:      razonCorriente,
        ivaGenerado:         ivaGenerado,
        ivaDescontable:      ivaDescontable,
        ivaEstimadoAPagar:   (ivaGenerado - ivaDescontable),
        retencionesMes:      retencionesMes,
        totalStockVal:       totalStockVal,
        criticalStockCount:  criticalStockCount,
        negativeStockCount:  negativeStockCount,
        totalInvMovs:        totalInvMovs,
        draftTxCount:        draftTxCount,

        // Módulo A: Nómina
        activeEmployeesCount: activeEmployeesCount,
        payrollCostMonth:     payrollCostMonth,
        payrollPendingDian:   payrollPendingDian,
        currentPayrollStatus: currentPayrollStatus,

        // Módulo B: DIAN
        dianResolutionsExpiring: dianResolutionsExpiring,
        dianDocsRejected:        dianDocsRejected,
        dianDocSoporteMonth:     dianDocSoporteMonth,
        dianSuccessRate:         dianSuccessRate,

        // Módulo C: POS
        posSalesToday:      posSalesToday,
        posAvgTicket:       posAvgTicket,
        posTicketsCount:    posTicketsCount,
        posOpenShiftsCount: posOpenShiftsCount,

        // Módulo D: Compras
        purchasesThisMonth:    purchasesThisMonth,
        purchasesPrevMonth:    purchasesPrevMonth,
        pendingPurchaseOrders: pendingPurchaseOrders,

        // Módulo G: Importaciones
        importsInTransitCount: importsInTransitCount,
        importsValueTransit:   importsValueTransit,
        importsPendingKardex:  importsPendingKardex,
      },
      posPaymentMethods:   posPaymentMethods,
      topSuppliers:        topSuppliers,
      monthlyTxCounts: monthlyTxCounts,
      txByType:        txByTypeData.map(d => ({ typeName: d.typeName, txCount: Number(d.txCount) || 0 })),
      recentActivity:  recentData.map(d => ({
        id: d.id, date: d.date, consecutive: d.consecutive,
        typeName: d.typeName, thirdParty: d.thirdParty,
      })),
      topCriticalProducts: topCriticalProds,
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
      currentMonthActivos:  activosVal,
      prevMonthActivos:     Number(balanceResult.prevActivos)    || 0,
      currentMonthPasivos:  pasivosVal,
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
