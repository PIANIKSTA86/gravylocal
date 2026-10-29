const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));

const r1 = db.prepare("SELECT COUNT(*) as count1 FROM transactions WHERE status = 'active' AND date >= '2026-09-01 00:00:00' AND date <= '2026-09-31 23:59:59'").get();
const r2 = db.prepare("SELECT COUNT(*) as count2 FROM transactions WHERE status = 'active' AND date >= '2026-09-01' AND date <= '2026-09-31 23:59:59'").get();
const r3 = db.prepare("SELECT COUNT(*) as count3 FROM transactions WHERE status = 'active' AND substr(date, 1, 7) = '2026-09'").get();

console.log('With 00:00:00:', r1.count1, 'Without 00:00:00:', r2.count2, 'substr 7:', r3.count3);
