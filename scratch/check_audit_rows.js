const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM audit_log WHERE entity LIKE '%asset%' OR entity LIKE '%niif%' OR details LIKE '%deprec%' OR action LIKE '%DEPR%' ORDER BY event_at DESC LIMIT 30", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Found audit rows:', rows.length);
    console.table(rows.map(r => ({
      action: r.action,
      entity: r.entity,
      details: (r.details || '').slice(0, 70),
      event_at: r.event_at
    })));
  }
  db.close();
});

