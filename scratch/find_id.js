const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const t of tables) {
  if (t.name.startsWith('_')) continue;
  try {
    const cols = db.prepare(`PRAGMA table_info(${t.name})`).all().map(c => c.name);
    for (const c of cols) {
      const match = db.prepare(`SELECT * FROM ${t.name} WHERE ${c} = '0zbb63nz7p6tzwc'`).all();
      if (match.length > 0) {
        console.log(`Found in table ${t.name}, column ${c}:`, match);
      }
    }
  } catch (e) {}
}

const alison = db.prepare("SELECT * FROM users WHERE name LIKE '%ALISON%'").all();
console.log('\nUsers matching ALISON:', alison);
