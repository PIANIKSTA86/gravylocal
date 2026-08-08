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
    const tables = ['pos_registers'];
    for (const t of tables) {
      const cols = await query(`PRAGMA table_info(${t})`);
      console.log(`\nTable Schema: ${t}`);
      cols.forEach(c => {
        console.log(`  - ${c.name} (${c.type}) ${c.notnull ? 'NOT NULL' : ''} ${c.dflt_value ? 'DEFAULT ' + c.dflt_value : ''}`);
      });
      const indexes = await query(`PRAGMA index_list(${t})`);
      console.log(`Indexes for ${t}:`);
      for (const idx of indexes) {
        const idxCols = await query(`PRAGMA index_info(${idx.name})`);
        console.log(`  - Index ${idx.name} (unique: ${idx.unique}): ${idxCols.map(c => c.name).join(', ')}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();
