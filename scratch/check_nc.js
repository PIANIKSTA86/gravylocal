const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) console.error("Error opening DB:", err);
});

db.serialize(() => {
  db.all("SELECT * FROM tx_lines WHERE description LIKE '%NC-00000048%' OR description LIKE '%FE-00002916%'", (e, lines) => {
    if (e) return console.error(e);
    console.log("=== MATCHING TX LINES ===", lines);
    if (lines && lines.length > 0) {
      const txIds = [...new Set(lines.map(l => l.tx_id))];
      db.all(`SELECT * FROM transactions WHERE id IN (${txIds.map(id => `'${id}'`).join(',')})`, (e2, txs) => {
        console.log("=== TRANSACTIONS FOR LINES ===", txs);
      });
      db.all(`SELECT * FROM invoices WHERE tx_id IN (${txIds.map(id => `'${id}'`).join(',')}) OR number LIKE '%48%' OR number LIKE '%2916%'`, (e3, invs) => {
        console.log("=== INVOICES ===", invs);
      });
      db.all(`SELECT id, doc_number, status, cufe, dian_response, sent_at FROM einvoice_docs WHERE tx_id IN (${txIds.map(id => `'${id}'`).join(',')})`, (e4, edocs) => {
        console.log("=== EINVOICE DOCS ===", edocs);
      });
    }
  });
});
