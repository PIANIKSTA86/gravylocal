const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/auxiliary.db');

const logs = db.prepare("SELECT * FROM _logs WHERE created <= '2026-10-23 19:50:27.600' ORDER BY rowid DESC LIMIT 15").all();
logs.reverse().forEach(l => {
  const d = JSON.parse(l.data);
  console.log(`[${l.created}] ${d.method} ${d.url} -> ${d.status}`);
  if (d.data) console.log('   request body:', d.data);
});
