const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM audit_log WHERE details LIKE '%AC-00000126%' OR details LIKE '%AC-00000127%'", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Audit for AC-00000126/127:');
    console.table(rows.map(r => ({
      action: r.action,
      entity: r.entity,
      details: r.details,
      event_at: r.event_at
    })));
  }
  db.close();
});

