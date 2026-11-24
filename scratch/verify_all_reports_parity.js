const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Cargar catálogo de cuentas
const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const accountById = new Map(accounts.map(a => [a.id, a]));
const accountByCode = new Map(accounts.map(a => [a.code, a]));

// 1. Simulación del NUEVO endpoint /api/gravy/account-saldos (usado por Cierre)
function getNewAccountSaldos(period, bookType = 'niif') {
  let bookCond = "";
  if (bookType === 'niif') {
    bookCond = " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";
  } else if (bookType === 'local') {
    bookCond = " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";
  }

  let sql = `
    SELECT l.account_id AS accountId, SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
  `;
  const binds = [];
  if (period && /^\d{4}-\d{2}$/.test(period)) {
    const pYear = parseInt(period.split('-')[0], 10);
    const pMonth = parseInt(period.split('-')[1], 10);
    const startPeriod = `${period}-01`;
    const lastDay = new Date(pYear, pMonth, 0).getDate();
    const endPeriodLimit = `${period}-${String(lastDay).padStart(2, '0')} 23:59:59`;
    sql += " AND t.date >= ? AND t.date <= ?";
    binds.push(startPeriod, endPeriodLimit);
  }
  sql += bookCond;
  sql += " GROUP BY l.account_id";

  const rows = db.prepare(sql).all(...binds);
  const saldos = {};
  for (const r of rows) {
    saldos[r.accountId] = Number(r.balance) || 0;
  }
  return saldos;
}

// 2. Simulación de /api/gravy/report-balances (usado por Estado de Resultados y Situación Financiera)
function getReportBalances(startDate, endDate, bookType = 'niif') {
  let bookCond = "";
  if (bookType === 'niif') {
    bookCond = " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";
  } else if (bookType === 'local') {
    bookCond = " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";
  }

  let sql = `
    SELECT l.account_id AS accountId, SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active' AND t.date <= ?
  `;
  const binds = [endDate.slice(0, 10) + " 23:59:59"];
  if (startDate) {
    sql += " AND t.date >= ?";
    binds.push(startDate.slice(0, 10));
  }
  sql += bookCond;
  sql += " GROUP BY l.account_id";

  const rows = db.prepare(sql).all(...binds);
  const res = {};
  for (const r of rows) res[r.accountId] = Number(r.balance) || 0;
  return res;
}

// 3. Simulación de /api/gravy/report-trial-balance (usado por Balance de Prueba)
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
    WHERE t.status = 'active' AND t.date <= ?
      ${bookCond}
    GROUP BY l.account_id
  `;
  const fDate = fromDate.slice(0, 10);
  return db.prepare(sql).all(fDate, fDate, toDateLimit, fDate, toDateLimit, toDateLimit);
}

console.log('========================================================================================');
console.log('VERIFICACIÓN DE PARIDAD POST-IMPLEMENTACIÓN (DOMESTIKO SAS - PUERTO 8090)');
console.log('========================================================================================\n');

let allPassed = true;

for (let m = 1; m <= 11; m++) {
  const monthStr = `2026-${String(m).padStart(2, '0')}`;
  const dt = new Date(2026, m, 0);
  const fromDate = `${monthStr}-01`;
  const toDate = `${monthStr}-${String(dt.getDate()).padStart(2, '0')}`;

  // A. Cierre de Mes (con nuevo endpoint / fallback corregido)
  const cierreSaldos = getNewAccountSaldos(monthStr);
  const byClassCierre = {};
  for (const a of accounts) {
    const cls = a.code.charAt(0);
    byClassCierre[cls] = (byClassCierre[cls] || 0) + Number(cierreSaldos[a.id] || 0);
  }
  const cierreIngresos = -(byClassCierre['4'] || 0);
  const cierreGastos = (byClassCierre['5'] || 0) + (byClassCierre['6'] || 0) + (byClassCierre['7'] || 0);
  const cierreUtilidad = cierreIngresos - cierreGastos;

  // B. Estado de Resultados (Solo el Mes)
  const erSaldos = getReportBalances(fromDate, toDate);
  const byClassER = {};
  for (const a of accounts) {
    const cls = a.code.charAt(0);
    byClassER[cls] = (byClassER[cls] || 0) + Number(erSaldos[a.id] || 0);
  }
  const erIngresos = -(byClassER['4'] || 0);
  const erGastos = (byClassER['5'] || 0) + (byClassER['6'] || 0) + (byClassER['7'] || 0);
  const erUtilidad = erIngresos - erGastos;

  // C. Balance de Prueba (Movimientos del Mes con nuevo árbol sin cuentas huérfanas)
  const tbRows = getTrialBalance(fromDate, toDate);
  const nodeById = new Map(accounts.map(a => [a.id, {
    id: a.id, code: a.code, parent_code: a.parent_code,
    ownPrev: 0, ownDebit: 0, ownCredit: 0,
    prev: 0, debit: 0, credit: 0, current: 0, children: []
  }]));
  for (const r of tbRows) {
    const n = nodeById.get(r.accountId);
    if (!n) continue;
    n.ownPrev += Number(r.prevBalance || 0);
    n.ownDebit += Number(r.debitSum || 0);
    n.ownCredit += Number(r.creditSum || 0);
  }
  const nodeByCode = new Map();
  nodeById.forEach(n => nodeByCode.set(n.code, n));
  const roots = [];
  nodeById.forEach(n => {
    const p = n.parent_code ? nodeByCode.get(n.parent_code) : null;
    if (p) p.children.push(n);
    else roots.push(n);
  });
  function rollup(n) {
    let p = n.ownPrev, d = n.ownDebit, c = n.ownCredit;
    for (const ch of n.children) {
      const s = rollup(ch);
      p += s.prev; d += s.debit; c += s.credit;
    }
    n.prev = p; n.debit = d; n.credit = c; n.current = p + d - c;
    return n;
  }
  roots.forEach(r => rollup(r));

  let tbIngresos = 0;
  let tbGastos = 0;
  for (const r of roots) {
    const cls = r.code.charAt(0);
    if (cls === '4') {
      tbIngresos += (r.credit - r.debit); // crédito neto
    } else if (['5', '6', '7'].includes(cls)) {
      tbGastos += (r.debit - r.credit);   // débito neto
    }
  }
  const tbUtilidad = tbIngresos - tbGastos;

  const diffCierreER = Math.abs(cierreUtilidad - erUtilidad);
  const diffERTB = Math.abs(erUtilidad - tbUtilidad);
  const isMatch = diffCierreER < 0.01 && diffERTB < 0.01;

  if (!isMatch) allPassed = false;

  console.log(`Período ${monthStr}:`);
  console.log(`  1. Cierre de Mes:        Ing: $${cierreIngresos.toLocaleString('es-CO')} | Gas: $${cierreGastos.toLocaleString('es-CO')} | Utilidad: $${cierreUtilidad.toLocaleString('es-CO')}`);
  console.log(`  2. Estado de Resultados: Ing: $${erIngresos.toLocaleString('es-CO')} | Gas: $${erGastos.toLocaleString('es-CO')} | Utilidad: $${erUtilidad.toLocaleString('es-CO')}`);
  console.log(`  3. Balance de Prueba:    Ing: $${tbIngresos.toLocaleString('es-CO')} | Gas: $${tbGastos.toLocaleString('es-CO')} | Utilidad: $${tbUtilidad.toLocaleString('es-CO')}`);
  console.log(`  ==> ESTADO: ${isMatch ? '✅ 100% CUADRADO EXACTO' : '❌ DISCREPANCIA DETECTADA'}\n`);
}

console.log('RESULTADO FINAL:', allPassed ? '🎉 TODAS LAS CONSULTAS COINCIDEN CON PARIDAD ABSOLUTA AL CENTAVO' : '⚠️ SE DETECTARON DESCUADRES');
