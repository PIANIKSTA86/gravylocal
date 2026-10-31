const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const rows = db.prepare(`
  SELECT 
    tl.id,
    tl.tx_id,
    t.number AS tx_number,
    t.date AS tx_date,
    tl.account_id,
    a.code AS account_code,
    tl.cross_doc_ref,
    tl.debit,
    tl.credit,
    tl.description,
    p.id AS prop_id,
    p.code AS prop_code,
    p.name AS prop_name
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  LEFT JOIN accounts a ON a.id = tl.account_id
  LEFT JOIN ph_properties p ON (
    tl.cross_doc_ref LIKE '%' || p.id OR
    tl.description LIKE '%' || p.code || '%'
  )
  WHERE t.status = 'active'
    AND (tl.cross_doc_ref LIKE 'ANTICIPO-%' OR tl.cross_doc_ref LIKE 'ANT-%')
  ORDER BY t.date ASC, t.number ASC
`).all();

console.log(`Found ${rows.length} lines with ANTICIPO-% or ANT-%:`);
for (const r of rows) {
  console.log(`[${r.tx_date}] ${r.tx_number} (Line ${r.id}): Ref="${r.cross_doc_ref}" Cr=$${r.credit} | Desc="${r.description}" | Prop: ${r.prop_code} (${r.prop_id})`);
}

