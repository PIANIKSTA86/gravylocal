const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  const query = `
    SELECT d.id, d.tx_id, d.status, d.dian_response, d.sent_at, t.number
    FROM einvoice_docs d
    LEFT JOIN transactions t ON d.tx_id = t.id
    ORDER BY d.sent_at DESC
    LIMIT 1
  `;
  db.get(query, [], (err, row) => {
    if (err) {
      console.error("Query error:", err);
      return;
    }
    console.log("=== LATEST E-INVOICE DOCUMENT ===");
    console.log(JSON.stringify(row, null, 2));
  });
});
