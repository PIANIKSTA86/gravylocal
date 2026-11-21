const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const rows = db.prepare(`
  SELECT 
    a.code, a.name,
    COALESCE(prop.tower, 'Sin Torre / General') as tower,
    count(*) as count,
    sum(l.debit) as deb, 
    sum(l.credit) as cred,
    sum(l.debit - l.credit) as saldo
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  LEFT JOIN ph_invoices phi ON (
    (l.cross_doc_ref != '' AND (l.cross_doc_ref = phi.number OR l.cross_doc_ref LIKE phi.number || '-%'))
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
  WHERE a.code IN ('13459501', '13459502', '13459503', '41701001', '42100501')
    AND t.status = 'active'
  GROUP BY a.code, COALESCE(prop.tower, 'Sin Torre / General')
  ORDER BY a.code ASC, tower ASC
`).all();

console.table(rows);

const rows134503 = db.prepare(`
  SELECT tl.id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number, t.cross_type
  FROM tx_lines tl 
  JOIN transactions t ON t.id = tl.tx_id 
  WHERE tl.account_id = (SELECT id FROM accounts WHERE code = '13459503') 
  LIMIT 5
`).all();
console.log('13459503 sample:');
console.table(rows134503);
