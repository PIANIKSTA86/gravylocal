const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/empresa_8091/pb_data/data.db');
db.get("SELECT * FROM _collections WHERE name = 'invoices'", (err, row) => {
  if (err) { console.error(err); return db.close(); }
  if (!row) { console.log('NOT FOUND'); return db.close(); }
  const schema = JSON.parse(row.fields);
  console.log(schema.map(f => `${f.name} (${f.type})`).join('\n'));
  db.close();
});
