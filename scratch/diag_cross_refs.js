const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT DISTINCT l.cross_doc_ref, t.cross_type, t.cross_number
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  LIMIT 20
`, (err, rows) => {
  console.log('Distinct cross_doc_ref and t.cross sample:', rows);

  db.all(`
    SELECT DISTINCT t.cross_type
    FROM transactions t
  `, (err2, types) => {
    console.log('Distinct cross_type in transactions:', types);
    db.close();
  });
});
