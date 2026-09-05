const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

const testSql = `
  SELECT
    l.account_id AS accountId,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
    COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
    COALESCE(tp.doc_number, '') AS thirdPartyDoc,
    COALESCE(prop.id, '') AS propertyId,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    SUM(CASE WHEN t.date < '2026-09-01' THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
    SUM(CASE WHEN t.date >= '2026-09-01' AND t.date <= '2026-09-30 23:59:59' THEN l.debit ELSE 0 END) AS debitSum,
    SUM(CASE WHEN t.date >= '2026-09-01' AND t.date <= '2026-09-30 23:59:59' THEN l.credit ELSE 0 END) AS creditSum
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
    AND t.date <= '2026-09-30 23:59:59'
    AND a.code LIKE '134595%'
  GROUP BY
    l.account_id,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
    COALESCE(prop.id, '')
`;

db.all(testSql, (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total grouped rows:', rows.length);
    let totalPrev = 0, totalDeb = 0, totalCred = 0;
    rows.forEach(r => {
      totalPrev += r.prevBalance;
      totalDeb += r.debitSum;
      totalCred += r.creditSum;
    });
    console.log(`Balance: Prev: ${totalPrev}, Deb: ${totalDeb}, Cred: ${totalCred}, Final: ${totalPrev + totalDeb - totalCred}`);
    
    // Check if distinct properties are shown!
    const distinctProps = new Set(rows.map(r => r.propertyCode).filter(Boolean));
    console.log(`Distinct properties count: ${distinctProps.size}`);

    // Show first 8 rows
    rows.slice(0, 8).forEach(r => {
      console.log(`  [${r.propertyCode} - ${r.propertyName}] ${r.thirdPartyName} (NIT: ${r.thirdPartyDoc}) -> Prev: ${r.prevBalance}, Deb: ${r.debitSum}, Cred: ${r.creditSum}`);
    });
  }
  db.close();
});
