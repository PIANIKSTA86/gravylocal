const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.serialize(() => {
  db.get(`
    SELECT COUNT(*) as count 
    FROM tx_lines l 
    JOIN accounts a ON a.id = l.account_id 
    WHERE (l.cross_doc_ref IS NOT NULL AND l.cross_doc_ref != '') 
      AND (a.maneja_cruce = 0 OR a.maneja_cruce IS NULL)
  `, (err, r) => {
    console.log('Invalid cross_doc_ref lines:', r.count);
  });

  db.get(`
    SELECT COUNT(*) as count 
    FROM accounts 
    WHERE LENGTH(code) >= 8 AND level < 5
  `, (err, r) => {
    console.log('8-digit accounts with level < 5:', r.count);
  });

  db.get(`
    SELECT COUNT(*) as count 
    FROM accounts 
    WHERE maneja_cruce = 1 AND (code NOT LIKE '13%' AND code NOT LIKE '2%')
  `, (err, r) => {
    console.log('Non-portfolio accounts with maneja_cruce=1:', r.count);
  });

  db.get(`
    SELECT key, value 
    FROM settings 
    WHERE key = 'doc_soporte_config_v1'
  `, (err, r) => {
    const cfg = JSON.parse(r.value);
    console.log('doc_soporte_config accounts:', cfg.accounting.accounts);
    db.close();
  });
});

