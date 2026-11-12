const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const auxPropertyId = 'sl1ks88emuyod8d';
const fromDate = '2026-03-11';
const toDate = '2026-10-31';

const query = `
  SELECT 
    t.number as comprobante,
    t.date as fecha,
    l.debit,
    l.credit,
    l.description,
    l.cross_doc_ref,
    prop.code as prop_code,
    prop.name as prop_name
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
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
    END,
    (SELECT p2.id FROM ph_properties p2 WHERE l.description LIKE '%' || p2.code || '%' OR l.description LIKE '%' || p2.name || '%' LIMIT 1)
  )
  WHERE a.code = '13459501' AND t.status = 'active'
    AND t.date >= ? AND t.date <= ?
    AND prop.id = ?
  ORDER BY t.date ASC, t.number ASC
`;

db.all(query, [fromDate, toDate, auxPropertyId], (err, rows) => {
  if (err) return console.error(err);
  console.log(`Report rows in Libro Auxiliar for 4104: ${rows.length}`);
  let totDeb = 0, totCred = 0;
  rows.forEach(r => {
    totDeb += r.debit;
    totCred += r.credit;
    console.log(`${r.fecha} | ${r.comprobante.padEnd(16)} | D:${r.debit.toString().padStart(8)} | C:${r.credit.toString().padStart(8)} | Ref:${(r.cross_doc_ref || '').padEnd(20)} | ${r.description}`);
  });
  console.log(`TOTAL: D=${totDeb}, C=${totCred}, Saldo=${totDeb - totCred}`);
});

