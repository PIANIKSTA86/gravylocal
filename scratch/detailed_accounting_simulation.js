const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Cargar cuentas
const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const accountById = new Map(accounts.map(a => [a.id, a]));
const accountByCode = new Map(accounts.map(a => [a.code, a]));

// Función para simular /api/gravy/report-balances
function getReportBalances(startDate, endDate, bookType = 'niif') {
  let bookCond = "";
  if (bookType === 'niif') {
    bookCond = " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";
  } else if (bookType === 'local') {
    bookCond = " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";
  }

  let sql = `
    SELECT
      l.account_id AS accountId,
      SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND t.date <= ?
  `;
  const params = [endDate.slice(0, 10)];
  if (startDate) {
    sql += " AND t.date >= ?";
    params.push(startDate.slice(0, 10));
  }
  sql += bookCond;
  sql += " GROUP BY l.account_id";

  const rows = db.prepare(sql).all(...params);
  const res = {};
  for (const r of rows) {
    res[r.accountId] = Number(r.balance) || 0;
  }
  return res;
}

// Función para simular /api/gravy/report-trial-balance
function getTrialBalance(fromDate, toDate, bookType = 'niif') {
  let toDateLimit = toDate.slice(0, 10) + " 23:59:59";
  let bookCond = "";
  if (bookType === 'niif') {
    bookCond = " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";
  } else if (bookType === 'local') {
    bookCond = " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";
  }

  let sql = `
    SELECT
      l.account_id AS accountId,
      SUM(CASE WHEN t.date < ? THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
      SUM(CASE WHEN t.date >= ? AND t.date <= ? THEN l.debit ELSE 0 END) AS debitSum,
      SUM(CASE WHEN t.date >= ? AND t.date <= ? THEN l.credit ELSE 0 END) AS creditSum
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND t.date <= ?
      ${bookCond}
    GROUP BY l.account_id
  `;
  const fDate = fromDate.slice(0, 10);
  const rows = db.prepare(sql).all(fDate, fDate, toDateLimit, fDate, toDateLimit, toDateLimit);
  return rows;
}

// Función para simular lo que hace cierre.ts -> API.getAccountSaldos(key)
function getCierreSaldos(period, bookType = 'niif') {
  let filterCond = "t.status = 'active'";
  if (bookType === 'niif') {
    filterCond += " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')";
  } else if (bookType === 'local') {
    filterCond += " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '')";
  }

  // Exactamente la lógica de api.ts:
  const [yearStr, monthStr] = period.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;

  const sql = `
    SELECT l.account_id, SUM(l.debit - l.credit) as balance
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    WHERE ${filterCond}
      AND t.date >= ? AND t.date < ?
    GROUP BY l.account_id
  `;
  const rows = db.prepare(sql).all(startDate, endDate);
  const saldos = {};
  for (const r of rows) {
    saldos[r.account_id] = Number(r.balance) || 0;
  }
  return saldos;
}

// Simulación de cálculo de Cierre
function computeCierre(period) {
  const saldos = getCierreSaldos(period);
  const byClass = {};
  for (const a of accounts) {
    const cls = (a.code || '').charAt(0);
    if (!byClass[cls]) byClass[cls] = 0;
    byClass[cls] += Number(saldos[a.id] || 0);
  }
  const ingresos = -(byClass['4'] || 0);
  const gastos = (byClass['5'] || 0) + (byClass['6'] || 0) + (byClass['7'] || 0);
  const utilidad = ingresos - gastos;
  return { ingresos, gastos, utilidad };
}

// Simulación de Estado de Resultados para un mes (periodType = 'month' y 'year')
function computeEstadoResultados(monthStr, periodType = 'month') {
  const dt = new Date(Number(monthStr.slice(0, 4)), Number(monthStr.slice(5, 7)), 0);
  const endDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')} 23:59:59`;
  let startDate = '';
  if (periodType === 'month') {
    startDate = `${monthStr}-01 00:00:00`;
  } else if (periodType === 'year') {
    startDate = `${monthStr.slice(0, 4)}-01-01 00:00:00`;
  }

  const balNow = getReportBalances(startDate, endDate);

  // Helper para jerarquía de ER
  function getSectionTotal(kind) {
    const secAccs = accounts.filter(a => String(a.code || '').startsWith(kind));
    const nodeById = new Map(secAccs.map(acc => {
      const baseNow = Number(balNow[acc.id] || 0);
      const ownNow = kind === '4' ? -baseNow : baseNow;
      return [acc.id, {
        id: acc.id, code: acc.code, parentCode: acc.parent_code, ownNow, now: 0, children: []
      }];
    }));
    const byCode = new Map();
    nodeById.forEach(n => { if (n.code) byCode.set(n.code, n); });
    const roots = [];
    nodeById.forEach(n => {
      const p = n.parentCode ? byCode.get(n.parentCode) : null;
      if (p) p.children.push(n);
      else roots.push(n);
    });
    const calcNode = n => {
      let now = n.ownNow;
      for (const c of n.children) now += calcNode(c);
      n.now = now;
      return now;
    };
    roots.forEach(r => calcNode(r));
    return roots.reduce((s, r) => s + r.now, 0);
  }

  const ing = getSectionTotal('4');
  const gas = getSectionTotal('5');
  const cos = getSectionTotal('6');
  const otr = getSectionTotal('7');
  const totalGastos = gas + cos + otr;
  const utilidad = ing - totalGastos;
  return { ing, gas, cos, otr, totalGastos, utilidad };
}

// Simulación de Balance de Prueba para un rango
function computeTrialBalance(fromDate, toDate) {
  const data = getTrialBalance(fromDate, toDate);
  const accountByIdLocal = new Map(accounts.map(a => [a.id, {
    id: a.id, code: a.code, name: a.name, parent_code: a.parent_code,
    ownPrev: 0, ownDebit: 0, ownCredit: 0,
    prev: 0, debit: 0, credit: 0, current: 0, children: []
  }]));
  const accountByCodeLocal = new Map();
  accountByIdLocal.forEach(v => { if (v.code) accountByCodeLocal.set(v.code, v); });

  for (const row of data) {
    const acc = accountByIdLocal.get(row.accountId);
    if (!acc) continue;
    acc.ownPrev += Number(row.prevBalance || 0);
    acc.ownDebit += Number(row.debitSum || 0);
    acc.ownCredit += Number(row.creditSum || 0);
  }

  const roots = [];
  accountByIdLocal.forEach(acc => {
    const p = acc.parent_code ? accountByCodeLocal.get(acc.parent_code) : null;
    if (p) p.children.push(acc);
    else roots.push(acc);
  });

  const calcNode = node => {
    let prev = node.ownPrev;
    let debit = node.ownDebit;
    let credit = node.ownCredit;
    for (const c of node.children) {
      const sc = calcNode(c);
      prev += sc.prev;
      debit += sc.debit;
      credit += sc.credit;
    }
    node.prev = prev;
    node.debit = debit;
    node.credit = credit;
    node.current = prev + debit - credit;
    return { prev, debit, credit, current: node.current };
  };
  roots.forEach(r => calcNode(r));

  // Obtener raíces por clase
  const rootsByClass = {};
  for (const r of roots) {
    const cls = r.code.charAt(0);
    rootsByClass[cls] = r;
  }

  // Clase 4: ingresos (en trial balance current es prev + debit - credit, negativo para crédito)
  // Pero miremos movimiento del periodo (debit - credit) vs saldo final
  const cl4 = rootsByClass['4'] || { prev: 0, debit: 0, credit: 0, current: 0 };
  const cl5 = rootsByClass['5'] || { prev: 0, debit: 0, credit: 0, current: 0 };
  const cl6 = rootsByClass['6'] || { prev: 0, debit: 0, credit: 0, current: 0 };
  const cl7 = rootsByClass['7'] || { prev: 0, debit: 0, credit: 0, current: 0 };

  // En el periodo seleccionado:
  const ingMovPeriodo = -(cl4.debit - cl4.credit); // crédito neto = ingresos
  const gasMovPeriodo = (cl5.debit - cl5.credit) + (cl6.debit - cl6.credit) + (cl7.debit - cl7.credit);
  const utilidadMovPeriodo = ingMovPeriodo - gasMovPeriodo;

  // Si alguien mira saldo actual (current = acumulado a la fecha si fromDate > inicio):
  const ingSaldoFinal = -cl4.current;
  const gasSaldoFinal = cl5.current + cl6.current + cl7.current;
  const utilidadSaldoFinal = ingSaldoFinal - gasSaldoFinal;

  return {
    cl4, cl5, cl6, cl7,
    ingMovPeriodo, gasMovPeriodo, utilidadMovPeriodo,
    ingSaldoFinal, gasSaldoFinal, utilidadSaldoFinal
  };
}

console.log('========================================================================================');
console.log('COMPARACIÓN EN DOMESTIKO SAS PARA CADA MES DE 2026:');
console.log('========================================================================================\n');

for (let m = 1; m <= 11; m++) {
  const monthStr = `2026-${String(m).padStart(2, '0')}`;
  const dt = new Date(2026, m, 0);
  const fromDate = `${monthStr}-01`;
  const toDate = `${monthStr}-${String(dt.getDate()).padStart(2, '0')}`;

  const cierre = computeCierre(monthStr);
  const erMonth = computeEstadoResultados(monthStr, 'month');
  const erYear = computeEstadoResultados(monthStr, 'year');
  const trial = computeTrialBalance(fromDate, toDate);

  console.log(`>>> MES: ${monthStr} (${fromDate} al ${toDate}) <<<`);
  console.log(`  CIERRE DE MES:`);
  console.log(`    Ingresos: ${cierre.ingresos.toLocaleString('es-CO')} | Gastos: ${cierre.gastos.toLocaleString('es-CO')} | Utilidad: ${cierre.utilidad.toLocaleString('es-CO')}`);
  console.log(`  ESTADO DE RESULTADOS (SOLO EL MES):`);
  console.log(`    Ingresos: ${erMonth.ing.toLocaleString('es-CO')} | Gastos+Costos: ${erMonth.totalGastos.toLocaleString('es-CO')} | Utilidad: ${erMonth.utilidad.toLocaleString('es-CO')}`);
  console.log(`  ESTADO DE RESULTADOS (ACUMULADO AÑO):`);
  console.log(`    Ingresos: ${erYear.ing.toLocaleString('es-CO')} | Gastos+Costos: ${erYear.totalGastos.toLocaleString('es-CO')} | Utilidad: ${erYear.utilidad.toLocaleString('es-CO')}`);
  console.log(`  BALANCE DE PRUEBA (MOVIMIENTO DEL MES):`);
  console.log(`    Ingresos (Créd-Déb): ${trial.ingMovPeriodo.toLocaleString('es-CO')} | Gastos (Déb-Créd): ${trial.gasMovPeriodo.toLocaleString('es-CO')} | Utilidad Periodo: ${trial.utilidadMovPeriodo.toLocaleString('es-CO')}`);
  console.log(`  BALANCE DE PRUEBA (SALDO ACTUAL AL CORTE):`);
  console.log(`    Ingresos (Créd-Déb): ${trial.ingSaldoFinal.toLocaleString('es-CO')} | Gastos (Déb-Créd): ${trial.gasSaldoFinal.toLocaleString('es-CO')} | Utilidad Saldo: ${trial.utilidadSaldoFinal.toLocaleString('es-CO')}`);
  
  const diffCierreVsErMonth = cierre.utilidad - erMonth.utilidad;
  const diffErMonthVsTrial = erMonth.utilidad - trial.utilidadMovPeriodo;
  console.log(`  --> DISCREPANCIA Cierre vs ER(Mes): ${diffCierreVsErMonth.toLocaleString('es-CO')}`);
  console.log(`  --> DISCREPANCIA ER(Mes) vs Balance(Mov): ${diffErMonthVsTrial.toLocaleString('es-CO')}`);
  console.log('----------------------------------------------------------------------------------------');
}
