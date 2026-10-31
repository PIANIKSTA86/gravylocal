const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbPath = 'pb_data/data.db';
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

function runAgingSimulation(mode, accountCodesParam, asOfDate = '2026-10-30') {
  const isCxC = mode === 'cxc';
  const binds = { asOfDateLimit: asOfDate + " 23:59:59" };
  const selectedAccountCodes = accountCodesParam
    ? accountCodesParam.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  let filterClause = "";
  if (selectedAccountCodes.length > 0) {
    const accPlaceholders = selectedAccountCodes.map((_, idx) => `$acc_${idx}`).join(',');
    selectedAccountCodes.forEach((val, idx) => {
      binds[`acc_${idx}`] = val;
    });
    filterClause = `(a.code IN (${accPlaceholders}) OR a.id IN (${accPlaceholders}))`;
  } else {
    filterClause = isCxC
      ? "(a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))"
      : "(a.code LIKE '2205%' OR ((a.code LIKE '22%' OR a.code LIKE '23%' OR a.code LIKE '25%') AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))";
  }

  const sql = `
    SELECT
      l.id,
      l.debit,
      l.credit,
      l.cross_doc_ref,
      a.code as account_code,
      a.name as account_name,
      a.nature as account_nature,
      a.maneja_cruce as account_maneja_cruce,
      a.requires_third_party as account_requires_third_party,
      COALESCE(tp.name, 'Sin tercero') as third_party_name
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND t.date <= $asOfDateLimit
      AND (${filterClause})
  `;

  const rows = db.prepare(sql).all(binds);

  // Group by account
  const byAcc = {};
  for (const r of rows) {
    const code = r.account_code;
    if (!byAcc[code]) byAcc[code] = { count: 0, deb: 0, cred: 0, name: r.account_name };
    byAcc[code].count++;
    byAcc[code].deb += r.debit;
    byAcc[code].cred += r.credit;
  }
  return { totalLines: rows.length, byAcc };
}

console.log('=== TEST 1: Default CxC (sin cuentas seleccionadas) ===');
const res1 = runAgingSimulation('cxc', '');
console.log('Total líneas:', res1.totalLines);
for (const [code, info] of Object.entries(res1.byAcc)) {
  console.log(`  ${code}: ${info.count} líneas | ${info.name}`);
}

console.log('\n=== TEST 2: Filtrando SOLO cuenta 11050502 (CAJA CONSUMIDOR FINAL) ===');
const res2 = runAgingSimulation('cxc', '11050502');
console.log('Total líneas:', res2.totalLines);
for (const [code, info] of Object.entries(res2.byAcc)) {
  console.log(`  ${code}: ${info.count} líneas | ${info.name} | Total Deb: ${info.deb} | Total Cred: ${info.cred}`);
}

console.log('\n=== TEST 3: Filtrando MÚLTIPLES cuentas (11050502 + 13050501) ===');
const res3 = runAgingSimulation('cxc', '11050502,13050501');
console.log('Total líneas:', res3.totalLines);
for (const [code, info] of Object.entries(res3.byAcc)) {
  console.log(`  ${code}: ${info.count} líneas | ${info.name}`);
}

db.close();

