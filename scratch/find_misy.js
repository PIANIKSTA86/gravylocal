const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

function findDbs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(findDbs(full));
    } else if (file.endsWith('.db')) {
      results.push(full);
    }
  }
  return results;
}

const targetId = 'misy1buc6ekobyu';
const dbs = findDbs('.');

for (const dbPath of dbs) {
  try {
    const db = new sqlite3.Database(dbPath);
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err || !tables) return;
      for (const t of tables) {
        db.get(`SELECT id FROM "${t.name}" WHERE id = ?`, [targetId], (e, r) => {
          if (r) {
            console.log(`FOUND ${targetId} IN: ${dbPath} -> TABLE: ${t.name}`);
          }
        });
      }
    });
  } catch (_) {}
}

