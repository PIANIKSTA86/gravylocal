const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function checkLogs(dbPath) {
  console.log(`Checking logs DB at: ${dbPath}`);
  try {
    const db = new DatabaseSync(dbPath);

    // List tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Tables in logs DB:", tables.map(t => t.name).join(', '));

    // If there is a log or requests table, query recent ones
    // Usually it has a table named 'requests' or similar
    const requestTable = tables.find(t => t.name.toLowerCase().includes('request') || t.name.toLowerCase().includes('log'));
    if (requestTable) {
      console.log(`\nRecent 10 entries from ${requestTable.name}:`);
      const logs = db.prepare(`SELECT * FROM ${requestTable.name} ORDER BY rowid DESC LIMIT 10`).all();
      logs.forEach(l => {
        console.log(`-----------------------------------`);
        // print columns
        for (const [k, v] of Object.entries(l)) {
          if (k === 'data' || k === 'details' || k === 'meta' || k === 'error') {
            try {
              console.log(`${k}:`, JSON.stringify(JSON.parse(v), null, 2));
            } catch (_) {
              console.log(`${k}:`, v);
            }
          } else {
            console.log(`${k}:`, v);
          }
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

const rootDir = path.resolve(__dirname, '..');
checkLogs(path.join(rootDir, 'pb_data', 'logs.db'));
