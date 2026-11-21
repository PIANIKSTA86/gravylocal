const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const fromDate = '2026-06-01';
const toDate = '2026-06-30';

// Check lines in 13459501 between 2026-06-01 and 2026-06-30
const sampleLines = db.prepare(`
  SELECT 
    l.id, l.cross_doc_ref, l.description, t.number as tx_num, t.cross_type, t.cross_number,
    t.teso_params,
    phi.number as phi_number, phi.property_id as phi_prop_id,
    prop.id as prop_id, prop.code as prop_code, prop.tower
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
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
  WHERE a.code = '13459501' AND t.status = 'active' AND t.date <= ?
  LIMIT 20
`).all(toDate + ' 23:59:59');

console.table(sampleLines);
