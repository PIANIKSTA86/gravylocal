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
    const terms = ['233540%'];
    console.log("=== Matching Accounts ===");
    for (const term of terms) {
      const accounts = await query(`SELECT id, code, name FROM accounts WHERE code LIKE ? LIMIT 15`, [term]);
      console.log(`\nMatches for code ${term}:`);
      accounts.forEach(a => console.log(`  - ${a.code} [ID: ${a.id}]: ${a.name}`));
    }
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();
