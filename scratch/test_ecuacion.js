const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const accountById = new Map(accounts.map(a => [a.id, a]));

function testEcuacion(endDateStr) {
  const sql = `
    SELECT
      l.account_id AS accountId,
      SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND t.date <= ?
      AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')
    GROUP BY l.account_id
  `;
  const rows = db.prepare(sql).all(endDateStr);
  const bal = {};
  for (const r of rows) bal[r.accountId] = Number(r.balance) || 0;

  let totalActivo = 0;
  let totalPasivo = 0;
  let totalPatrimonioCuentas = 0;
  let resultadoPeriodo = 0;

  for (const a of accounts) {
    const val = bal[a.id] || 0;
    const cls = a.code.charAt(0);
    if (cls === '1') {
      totalActivo += val; // activo debito - credito
    } else if (cls === '2') {
      totalPasivo += -val; // pasivo credito - debito
    } else if (cls === '3') {
      totalPatrimonioCuentas += -val; // patrimonio credito - debito
    } else if (['4', '5', '6', '7'].includes(cls)) {
      resultadoPeriodo -= val; // ingresos - gastos = -(debito - credito) = credito - debito
    }
  }

  const totalPatrimonioFinal = totalPatrimonioCuentas + resultadoPeriodo;
  const totalPyP = totalPasivo + totalPatrimonioFinal;
  const diff = totalActivo - totalPyP;

  console.log(`Corte: ${endDateStr}`);
  console.log(`  Activo: ${totalActivo.toLocaleString('es-CO')}`);
  console.log(`  Pasivo: ${totalPasivo.toLocaleString('es-CO')}`);
  console.log(`  Patrimonio (libros): ${totalPatrimonioCuentas.toLocaleString('es-CO')}`);
  console.log(`  Resultado del Ejercicio: ${resultadoPeriodo.toLocaleString('es-CO')}`);
  console.log(`  Patrimonio Total: ${totalPatrimonioFinal.toLocaleString('es-CO')}`);
  console.log(`  Pasivo + Patrimonio: ${totalPyP.toLocaleString('es-CO')}`);
  console.log(`  Diferencia (Activo - Pasivo - Patrimonio): ${diff}`);
}

testEcuacion('2026-05-31');
testEcuacion('2026-10-31');
