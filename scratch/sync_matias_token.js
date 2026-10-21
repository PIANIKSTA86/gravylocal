const sqlite3 = require('sqlite3').verbose();
const dbSrc = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
const dbDst = new sqlite3.Database('pb_data/data.db');

dbSrc.all("SELECT key, value FROM settings WHERE key LIKE '%matias%' OR key = 'einvoice_method'", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  let pending = rows.length;
  rows.forEach(r => {
    dbDst.run(
      "INSERT INTO settings (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      ['set_' + r.key, r.key, r.value],
      (e) => {
        if (e) console.error('Error syncing ' + r.key, e);
        else console.log('Synced setting:', r.key);
        if (--pending === 0) {
          dbSrc.close();
          dbDst.close();
          console.log('All settings synced successfully.');
        }
      }
    );
  });
});
