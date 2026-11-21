const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
  console.log("=== BUSCANDO EN audit_logs ALREDEDOR DE 2026-11-19 21:31 ===");
  db.all("SELECT * FROM audit_logs WHERE created LIKE '2026-11-19 21:3%' OR target_id IN ('wh6k9yrppx2la88', 'fmyzflvzcg3jqso') ORDER BY created ASC", [], (err, rows) => {
    if (err) console.error("Error audit_logs:", err.message);
    else console.log("audit_logs:\n", JSON.stringify(rows, null, 2));
  });

  console.log("=== INSPECCIONANDO CREACIÓN DE invoices Y transactions ===");
  db.get("SELECT id, number, status, tx_id, tx_number, created, updated FROM invoices WHERE id = 'wh6k9yrppx2la88'", (err, inv) => {
    console.log("Invoice wh6k9yrppx2la88:", inv);
  });
  db.get("SELECT id, number, date, description, created, updated FROM transactions WHERE id = 'fmyzflvzcg3jqso'", (err, tx) => {
    console.log("Transaction fmyzflvzcg3jqso:", tx);
  });
});
