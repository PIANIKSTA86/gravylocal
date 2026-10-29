const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM audit_log WHERE event_at LIKE '2026-10-19%' ORDER BY event_at ASC", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Audit logs on 2026-10-19:', rows.length);
    console.table(rows.map(r => ({
      action: r.action,
      entity: r.entity,
      details: r.details,
      event_at: r.event_at
    })));
  }
  db.close();
});

