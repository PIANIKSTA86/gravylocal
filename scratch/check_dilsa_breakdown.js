const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const c403Id = '8o4wbhutgct7n4w';
const a302Id = 'fg8xppgqc75rb8k';

console.log('=== ALL TX_LINES FOR 13459501 JOINED WITH PH_INVOICES FOR THIRD DILSA ===');
const lines = db.prepare(`
  SELECT t.number as tx_num, t.date, tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
         phi.number as inv_num, p.code as prop_code, p.name as prop_name
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  LEFT JOIN ph_invoices phi ON (
    tl.cross_doc_ref != '' AND (
      tl.cross_doc_ref = phi.number OR tl.cross_doc_ref LIKE phi.number || '-%'
    )
  )
  LEFT JOIN ph_properties p ON p.id = phi.property_id
  WHERE a.code = '13459501' AND tl.third_party_id = 's2al2xdlkno843k'
  ORDER BY t.date ASC, t.number ASC
`).all();

console.table(lines);
