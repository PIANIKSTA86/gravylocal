const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all("SELECT id, number, period, total, tx_id FROM ph_invoices WHERE property_id = (SELECT id FROM ph_properties WHERE code = '31204')", (err, invs) => {
  console.log('Invoices for 31204:');
  invs.forEach(i => {
    db.all("SELECT l.debit, l.credit, a.code, t.number FROM tx_lines l JOIN accounts a ON a.id = l.account_id JOIN transactions t ON t.id = l.tx_id WHERE l.tx_id = ?", [i.tx_id], (err, lines) => {
      console.log(`\nInv: ${i.number} (Total: ${i.total}, tx_id: ${i.tx_id})`);
      lines.forEach(l => console.log(`  Tx ${l.number} | Acc: ${l.code} | D: ${l.debit} | C: ${l.credit}`));
    });
  });
});

