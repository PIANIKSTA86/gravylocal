const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT key, value FROM settings WHERE key IN ('invoice_footer_text', 'invoice_header_text')", (err, rows) => {
  rows.forEach(r => {
    console.log(`\n--- KEY: ${r.key} in pb_data ---`);
    console.log(r.value);
  });

  const db8092 = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
  db8092.all("SELECT key, value FROM settings WHERE key IN ('invoice_footer_text', 'invoice_header_text')", (err2, rows2) => {
    console.log('\n--- KEYs in empresa_8092 ---');
    console.log(rows2);
    db.close();
    db8092.close();
  });
});

