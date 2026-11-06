const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db', { open: true, readOnly: true });

// Check what accounts are involved in dashboard query
const asOfDate = '2026-11-02';
const asOfLimit = asOfDate + " 23:59:59";
const asOfTime = new Date(asOfDate + "T23:59:59").getTime();

const cxcSql = `
  SELECT
    l.account_id,
    a.code AS accCode,
    a.name AS accName,
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
    AND t.date <= $asOfLimit
    AND (a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))
  GROUP BY l.account_id, l.third_party_id, crossDocRef
`;

const rows = db.prepare(cxcSql).all({ asOfLimit });

let carteraBruta = 0;
let carteraAnticipos = 0;
let carteraPorVencer = 0;
let carteraVencida = 0;
let cartera0_30 = 0, cartera31_60 = 0, cartera61_90 = 0, carteraMayor90 = 0;

const byAcc = {};

for (const doc of rows) {
  const nature = String(doc.accNature || 'debit').toLowerCase();
  const deb = Number(doc.totDebit) || 0;
  const cred = Number(doc.totCredit) || 0;
  const openBal = nature === 'debit' ? (deb - cred) : (cred - deb);

  if (Math.abs(openBal) <= 0.0001) continue;

  if (!byAcc[doc.accCode]) byAcc[doc.accCode] = { deb: 0, cred: 0, pos: 0, neg: 0, count: 0, name: doc.accName };
  byAcc[doc.accCode].count++;
  if (openBal > 0) {
    byAcc[doc.accCode].pos += openBal;
    carteraBruta += openBal;
  } else {
    byAcc[doc.accCode].neg += Math.abs(openBal);
    carteraAnticipos += Math.abs(openBal);
  }

  const lineDue = String(doc.lineDueDate || '').trim();
  const dateOnly = String(doc.docDate || '').split(" ")[0] || asOfDate;
  const pDays = Number(doc.paymentDays) || 0;

  let dueTime = 0;
  if (lineDue) {
    dueTime = new Date(lineDue.split(" ")[0] + "T00:00:00").getTime();
  } else {
    dueTime = new Date(dateOnly + "T00:00:00").getTime() + (pDays * 86400000);
  }

  const expiredDays = Math.floor((asOfTime - dueTime) / 86400000);

  if (openBal < 0) {
    // anticipo
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

const carteraTotal = Math.max(0, carteraBruta - carteraAnticipos);

console.log('=== DASHBOARD RESULT (Todas las cuentas elegibles de la 13) ===');
console.log('carteraBruta:', carteraBruta);
console.log('carteraAnticipos:', carteraAnticipos);
console.log('carteraTotal (Neta):', carteraTotal);
console.log('carteraVencida (Mora):', carteraVencida);
console.log('carteraPorVencer:', carteraPorVencer);
console.log('Buckets: 0-30:', cartera0_30, '31-60:', cartera31_60, '61-90:', cartera61_90, '>90:', carteraMayor90);
console.log('\nPor cuenta en Dashboard:');
for (const [code, info] of Object.entries(byAcc)) {
  console.log(`  ${code} (${info.name}): +${info.pos} | -${info.neg} | Neto = ${info.pos - info.neg}`);
}

db.close();

