const { DatabaseSync } = require('node:sqlite');

for (const dbPath of ['pb_data/data.db', 'empresas/empresa_8091/pb_data/data.db']) {
  console.log('=== Checking recent updates in:', dbPath);
  const db = new DatabaseSync(dbPath);
  for (const table of ['payroll_lines', 'payroll_novelties', 'electronic_payrolls', 'payroll_settlements']) {
    try {
      const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
      if (cols.includes('updated')) {
        const rows = db.prepare(`SELECT id, updated FROM ${table} ORDER BY updated DESC LIMIT 5`).all();
        console.log(`Table ${table} latest updated:`, rows);
      }
    } catch (e) {
      console.log(`Table ${table} error:`, e.message);
    }
  }
}
