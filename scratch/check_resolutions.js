const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT id, name, document_type, prefix, resolution_number, number_from, number_to, active FROM dian_resolutions", (err, rows) => {
  console.log("=== DIAN RESOLUTIONS ===");
  console.log(rows);
});

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%' OR key LIKE '%dian%' OR key LIKE '%company%'", (err, rows) => {
  console.log("=== SETTINGS ===");
  console.log(rows);
});
