const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const fromDate = '2026-01-01';
const toDate = '2026-11-20';

// Test query matching reports_optimized.pb.js with includeProperty=true and includeThird=true
const sql = `
  SELECT
    l.account_id AS accountId,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
    COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
    COALESCE(tp.doc_number, '') AS thirdPartyDoc,
    COALESCE(prop.id, '') AS propertyId,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    COALESCE(prop.tower, '') AS propertyTower,
    SUM(CASE WHEN t.date < ? THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
    SUM(CASE WHEN t.date >= ? AND t.date <= ? THEN l.debit ELSE 0 END) AS debitSum,
    SUM(CASE WHEN t.date >= ? AND t.date <= ? THEN l.credit ELSE 0 END) AS creditSum
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
    json_extract(t.teso_params, '$.ph_property_id'),
    CASE 
      WHEN l.cross_doc_ref LIKE 'ANTICIPO-%' THEN SUBSTR(l.cross_doc_ref, -15)
      WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) 
      ELSE NULL 
    END
  )
  WHERE t.status = 'active'
    AND t.date <= ?
    AND a.code IN ('13459501', '13459502', '41701001', '42100501')
  GROUP BY
    l.account_id,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
    COALESCE(prop.id, '')
`;

const rows = db.prepare(sql).all(fromDate, fromDate, toDate + ' 23:59:59', fromDate, toDate + ' 23:59:59', toDate + ' 23:59:59');

console.log('Total aggregated rows returned:', rows.length);

// Group by Account -> Tower
const accs = {};
for (const r of rows) {
  if (!accs[r.accountId]) accs[r.accountId] = { prev: 0, debit: 0, credit: 0, towers: {} };
  const a = accs[r.accountId];
  a.prev += r.prevBalance;
  a.debit += r.debitSum;
  a.credit += r.creditSum;

  const twName = r.propertyTower || 'Sin Torre / General';
  if (!a.towers[twName]) a.towers[twName] = { prev: 0, debit: 0, credit: 0, countThird: 0 };
  const tw = a.towers[twName];
  tw.prev += r.prevBalance;
  tw.debit += r.debitSum;
  tw.credit += r.creditSum;
  tw.countThird++;
}

for (const [accId, a] of Object.entries(accs)) {
  const accRow = db.prepare('SELECT code, name FROM accounts WHERE id = ?').get(accId);
  console.log(`\n============================================================`);
  console.log(`CUENTA: ${accRow.code} - ${accRow.name}`);
  console.log(`Total Cuenta: Prev=${a.prev}, Deb=${a.debit}, Cred=${a.credit}, Saldo=${a.prev + a.debit - a.credit}`);
  console.log(`------------------------------------------------------------`);
  let sumTwDeb = 0, sumTwCred = 0, sumTwSaldo = 0;
  for (const [twName, tw] of Object.entries(a.towers)) {
    const s = tw.prev + tw.debit - tw.credit;
    sumTwDeb += tw.debit;
    sumTwCred += tw.credit;
    sumTwSaldo += s;
    console.log(`   ${twName.padEnd(25)}: Deb=${tw.debit.toLocaleString().padStart(12)}, Cred=${tw.credit.toLocaleString().padStart(12)}, Saldo=${s.toLocaleString().padStart(12)} (${tw.countThird} terceros)`);
  }
  console.log(`------------------------------------------------------------`);
  console.log(`Suma Torres : Deb=${sumTwDeb.toLocaleString().padStart(12)}, Cred=${sumTwCred.toLocaleString().padStart(12)}, Saldo=${sumTwSaldo.toLocaleString().padStart(12)}`);
  const diff = (a.prev + a.debit - a.credit) - sumTwSaldo;
  console.log(`Diferencia Cuadre: ${diff === 0 ? '0 COP (PERFECTO 100%)' : diff + ' COP'}`);
}
