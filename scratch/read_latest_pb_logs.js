const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/logs.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  // Let's get the latest 5 requests to /api/dian/emit
  const query = `
    SELECT id, created, method, url, status, data
    FROM requests
    WHERE url LIKE '%api/dian/emit%'
    ORDER BY created DESC
    LIMIT 5
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Query error:", err);
      return;
    }
    console.log("=== LATEST 5 DIAN EMIT REQUEST LOGS ===");
    rows.forEach(row => {
      console.log(`\nID: ${row.id} | Created: ${row.created}`);
      console.log(`URL: ${row.method} ${row.url} | Status: ${row.status}`);
      console.log(`Response Data: ${row.data}`);
    });
  });
});
