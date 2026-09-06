const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const sqlPeriod = `
  SELECT
    t.date AS fecha,
    t.number AS comprobante,
    t.id AS txId,
    l.account_id AS accountId,
    a.code AS accountCode,
    a.name AS accountName,
    a.nature AS accountNature,
    a.maneja_cruce AS accountManejaCruce,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
    COALESCE(tp.name, 'Sin tercero') AS thirdName,
    COALESCE(tp.doc_number, '') AS thirdDoc,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
    COALESCE(l.description, t.description, '') AS descripcion,
    l.debit AS debito,
    l.credit AS credito
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
    AND a.code LIKE '134595%'
  LIMIT 5
`;

console.log(db.prepare(sqlPeriod).all());
