const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  const logs = await query("SELECT * FROM audit_log WHERE target LIKE '%asset%' OR target LIKE '%niif%' OR details LIKE '%deprec%' OR action LIKE '%DEPR%' ORDER BY created DESC LIMIT 30");
  console.log('Audit logs count:', logs.length);
  console.table(logs.map(l => ({
    user: l.user_id,
    action: l.action,
    target: l.target,
    details: (l.details || '').slice(0, 60),
    created: l.created
  })));

  // Let's also check the latest 20 logs in general
  const latestLogs = await query("SELECT * FROM audit_log ORDER BY created DESC LIMIT 20");
  console.log('\nLatest 20 audit logs:');
  console.table(latestLogs.map(l => ({
    action: l.action,
    target: l.target,
    details: (l.details || '').slice(0, 60),
    created: l.created
  })));

  db.close();
}

main().catch(console.error);

