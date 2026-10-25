const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const aux = new DatabaseSync('pb_data/auxiliary.db');

const count = db.prepare('SELECT COUNT(*) as count FROM seller_tracking_logs').get();
console.log('Total logs in seller_tracking_logs:', count);

const lastLog = db.prepare('SELECT * FROM seller_tracking_logs ORDER BY created DESC LIMIT 1').get();
console.log('Last log in seller_tracking_logs:', lastLog);

const auxLogs = aux.prepare("SELECT * FROM _logs WHERE created >= '2026-10-23 23:13:48' ORDER BY rowid DESC LIMIT 20").all();
console.log('\nAuxiliary requests since 23:13:48Z:', auxLogs.length);
auxLogs.forEach(l => {
  const d = JSON.parse(l.data);
  console.log(`[${l.created}] ${d.method} ${d.url} -> ${d.status} (UA: ${d.userAgent?.slice(0, 30)})`);
});
