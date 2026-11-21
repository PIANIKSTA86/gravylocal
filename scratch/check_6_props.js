const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const targetProps = ['A-104', 'B-904', 'C-503', 'D-104', 'A-1202', 'A-602'];

for (const code of targetProps) {
  const lines = db.prepare(`
    SELECT t.number, t.date, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    WHERE a.code = '13459501' AND t.date <= '2026-06-30'
      AND tl.description LIKE '%${code}%'
    ORDER BY t.date ASC
  `).all();
  console.log(`=== Inmueble ${code} ===`);
  console.table(lines);
}
