const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.all(`
  SELECT d.id, d.tx_id, d.status, t.number, d.cufe, d.dian_response, d.sent_at 
  FROM einvoice_docs d 
  JOIN transactions t ON d.tx_id = t.id 
  WHERE d.status = 'aceptada' 
  ORDER BY d.rowid DESC LIMIT 10
`, (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.close();
});
