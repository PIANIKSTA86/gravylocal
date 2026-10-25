const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/auxiliary.db');

const logs = db.prepare("SELECT * FROM _logs WHERE data LIKE '%okhttp%' ORDER BY rowid DESC LIMIT 40").all();
console.log('Mobile app requests:', logs.length);
logs.forEach(l => {
  try {
    const d = JSON.parse(l.data);
    console.log(`[${l.created}] ${d.method} ${d.url} -> ${d.status}`);
    if (d.error || d.details) console.log('   ERR:', d.error, d.details);
  } catch(e) {
    console.log(`[${l.created}]`, l.data);
  }
});
