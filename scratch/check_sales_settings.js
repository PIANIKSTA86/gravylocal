const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key IN ('sales_settings_v2', 'pos_settings_v1', 'pos_settings', 'company_settings')", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  rows.forEach(r => {
    console.log(`=== ${r.key} ===`);
    try {
      console.log(JSON.stringify(JSON.parse(r.value), null, 2));
    } catch {
      console.log(r.value);
    }
  });
});
