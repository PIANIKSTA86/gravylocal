const sqlite3 = require('sqlite3').verbose();
const dbs = ['empresas/empresa_8091/pb_data/data.db', 'pb_data/data.db'];

dbs.forEach(path => {
  const db = new sqlite3.Database(path, (err) => {
    if (err) return console.log(`Could not open ${path}:`, err.message);
    db.run(`
      CREATE TABLE IF NOT EXISTS dian_logs (
        id TEXT PRIMARY KEY DEFAULT ('r'||lower(hex(randomblob(7)))),
        tx_id TEXT,
        document_number TEXT,
        document_type TEXT,
        endpoint TEXT,
        method TEXT DEFAULT 'POST',
        status_code INTEGER,
        status TEXT,
        is_valid INTEGER DEFAULT 0,
        cufe TEXT,
        message TEXT,
        request_payload JSON,
        response_payload JSON,
        duration_ms INTEGER DEFAULT 0,
        created TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ')),
        updated TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ'))
      );
    `, (e) => {
      if (e) console.error(`Error creating dian_logs in ${path}:`, e);
      else {
        console.log(`dian_logs table verified in ${path}`);
        db.run("CREATE INDEX IF NOT EXISTS idx_dian_logs_tx ON dian_logs (tx_id)");
        db.run("CREATE INDEX IF NOT EXISTS idx_dian_logs_doc ON dian_logs (document_number)");
      }
    });
  });
});
