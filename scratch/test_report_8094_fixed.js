const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const sql = `
  SELECT
    l.account_id AS accountId,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
    COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
    COALESCE(tp.doc_number, '') AS thirdPartyDoc,
    COALESCE(prop.id, '') AS propertyId,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    SUM(CASE WHEN t.date < '2026-01-01' THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
    SUM(CASE WHEN t.date >= '2026-01-01' AND t.date <= '2026-12-31 23:59:59' THEN l.debit ELSE 0 END) AS debitSum,
    SUM(CASE WHEN t.date >= '2026-01-01' AND t.date <= '2026-12-31 23:59:59' THEN l.credit ELSE 0 END) AS creditSum
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
    AND t.date <= '2026-12-31 23:59:59'
    AND a.code LIKE '134595%'
  GROUP BY
    l.account_id,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
    COALESCE(prop.id, '')
  ORDER BY tp.name ASC
  LIMIT 15
`;

const rows = db.prepare(sql).all();
console.log(JSON.stringify(rows, null, 2));

// Also let's check total for 134595
const sumSql = `
  SELECT
    SUM(CASE WHEN t.date >= '2026-01-01' AND t.date <= '2026-12-31 23:59:59' THEN l.debit ELSE 0 END) AS totalDebit,
    SUM(CASE WHEN t.date >= '2026-01-01' AND t.date <= '2026-12-31 23:59:59' THEN l.credit ELSE 0 END) AS totalCredit
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
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
    AND t.date <= '2026-12-31 23:59:59'
    AND a.code LIKE '134595%'
`;
console.log("TOTAL 134595:", db.prepare(sumSql).get());
