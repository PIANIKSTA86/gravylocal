const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  try {
    const cols = await query('PRAGMA table_info(payroll_periods)');
    console.log('Table Schema: payroll_periods');
    cols.forEach(c => {
      console.log('  - ' + c.name + ' (' + c.type + ')');
    });
  } catch (err) {
    console.error(err.message);
  } finally {
    db.close();
  }
}

main();
