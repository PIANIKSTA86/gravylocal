const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const pCode = '1104';

db.serialize(() => {
  db.get("SELECT id, code, name FROM ph_properties WHERE code = ?", [pCode], (err, prop) => {
    console.log('PROPERTY:', prop);

    db.all("SELECT id, number, period, total, status, tx_id FROM ph_invoices WHERE property_id = ?", [prop.id], (err, invs) => {
      console.log('\n--- INVOICES IN ph_invoices ---');
      invs.forEach(i => console.log(i));

      db.all(`
        SELECT l.id, l.tx_id, l.debit, l.credit, l.cross_doc_ref, l.description, t.number as tx_num, t.date as tx_date, t.description as tx_desc
        FROM tx_lines l
        JOIN transactions t ON t.id = l.tx_id
        JOIN accounts a ON a.id = l.account_id
        WHERE a.code = '13459501' AND (l.cross_doc_ref LIKE '%1104%' OR l.description LIKE '%1104%' OR l.description LIKE '%A-104%')
        ORDER BY t.date ASC
      `, (err, lines) => {
        if (err) return console.error('SQL ERR:', err.message);
        console.log('\n--- TX_LINES in 13459501 ---');
        lines.forEach(l => console.log(l));
      });
    });
  });
});
