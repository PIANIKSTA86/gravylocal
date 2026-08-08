const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'empresas', 'empresa_8093', 'pb_data', 'data.db');
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
    const tables = [
      'third_parties',
      'transactions',
      'tx_lines'
    ];
    for (const t of tables) {
      const cols = await query(`PRAGMA table_info(${t})`);
      console.log(`\nTable Schema: ${t}`);
      cols.forEach(c => {
        console.log(`  - ${c.name} (${c.type}) ${c.notnull ? 'NOT NULL' : ''} ${c.dflt_value ? 'DEFAULT ' + c.dflt_value : ''}`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();
