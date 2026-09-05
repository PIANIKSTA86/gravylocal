const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`
  SELECT t.id, t.cross_type, t.cross_number, l.cross_doc_ref, l.third_party_id, l.debit, l.credit
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE a.code LIKE '134595%'
  LIMIT 10
`, (err, rows) => {
  if (err) console.error(err);
  else console.log('134595 lines:', rows);

  db.all(`SELECT id, number, property_id, tx_id FROM ph_invoices LIMIT 10`, (err2, invRows) => {
    if (err2) console.error(err2);
    else console.log('ph_invoices sample:', invRows);

    db.all(`SELECT count(*) as cnt FROM ph_invoices`, (err3, cntRows) => {
      if (err3) console.error(err3);
      else console.log('ph_invoices count:', cntRows);

      db.all(`SELECT count(*) as cnt FROM ph_properties`, (err4, propCnt) => {
        if (err4) console.error(err4);
        else console.log('ph_properties count:', propCnt);
        db.close();
      });
    });
  });
});
