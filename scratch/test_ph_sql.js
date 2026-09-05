const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const sql = `
  SELECT
    l.account_id AS accountId,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
    COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
    COALESCE(tp.doc_number, '') AS thirdPartyDoc,
    COALESCE(prop.id, '') AS propertyId,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    SUM(CASE WHEN t.date < '2026-08-01' THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
    SUM(CASE WHEN t.date >= '2026-08-01' AND t.date <= '2026-08-31 23:59:59' THEN l.debit ELSE 0 END) AS debitSum,
    SUM(CASE WHEN t.date >= '2026-08-01' AND t.date <= '2026-08-31 23:59:59' THEN l.credit ELSE 0 END) AS creditSum
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  LEFT JOIN ph_invoices phi_direct ON phi_direct.tx_id = t.id
  LEFT JOIN ph_invoices phi_cross ON (
    (t.cross_type = 'ph_invoices' AND phi_cross.number = t.cross_number)
    OR (l.cross_doc_ref != '' AND (
      l.cross_doc_ref = phi_cross.number
      OR l.cross_doc_ref LIKE phi_cross.number || '-%'
    ))
  )
  LEFT JOIN ph_properties prop ON prop.id = COALESCE(
    phi_direct.property_id,
    phi_cross.property_id,
    CASE WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) ELSE NULL END
  )
  WHERE t.status = 'active'
    AND t.date <= '2026-08-31 23:59:59'
  GROUP BY
    l.account_id,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
    COALESCE(prop.id, '')
  LIMIT 10
`;

db.all(sql, (err, rows) => {
  if (err) {
    console.error('SQL Error:', err);
  } else {
    console.log('SQL Success! Rows found:', rows.length);
    if (rows.length) console.log(rows[0]);
  }
  db.close();
});
