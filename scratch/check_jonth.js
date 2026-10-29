const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT id, name, doc_number FROM third_parties WHERE name LIKE '%JONTH%' OR name LIKE '%QUIÑONEZ%'", (e, thirds) => {
  console.log("Thirds:", thirds);
  if (thirds && thirds.length > 0) {
    const tid = thirds[0].id;
    db.all(`SELECT id, number, date, tx_type_id, description, status FROM transactions WHERE third_party_id = '${tid}' ORDER BY date DESC LIMIT 10`, (e2, txs) => {
      console.log("TXs for third:", txs);
    });
    db.all(`SELECT id, number, date, total, status FROM invoices WHERE customer_id = '${tid}' ORDER BY date DESC LIMIT 10`, (e3, invs) => {
      console.log("Invoices for third:", invs);
    });
  }
});
