const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}

async function main() {
  const tables = ['payroll_lines', 'payroll_periods', 'third_parties', 'electronic_payrolls', 'settings'];
  for (const t of tables) {
    try {
      const cols = await query('PRAGMA table_info(' + t + ')');
      console.log('\n=== ' + t + ' ===');
      cols.forEach(c => console.log('  ' + c.name + ' (' + c.type + ')'));
    } catch(e) { console.log(t + ': NOT FOUND'); }
  }
  db.close();
}
main().catch(console.error);
