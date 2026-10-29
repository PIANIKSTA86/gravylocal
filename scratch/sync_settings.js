const sqlite3 = require('sqlite3').verbose();
const dbSrc = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
const dbDst = new sqlite3.Database('pb_data/data.db');

dbSrc.all("SELECT key, value FROM settings WHERE key LIKE 'matias%'", (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  if (rows && rows.length) {
    dbDst.serialize(() => {
      const stmt = dbDst.prepare("INSERT INTO settings (id, key, value) VALUES ('set_' || lower(hex(randomblob(6))), ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
      rows.forEach(r => {
        stmt.run(r.key, r.value);
        console.log('Synced setting to root pb_data/data.db:', r.key);
      });
      stmt.finalize();
      dbSrc.close();
      dbDst.close();
    });
  } else {
    dbSrc.close();
    dbDst.close();
  }
});
