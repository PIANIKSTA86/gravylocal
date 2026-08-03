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
    SELECT d.id, d.tx_id, d.status, d.dian_response, d.sent_at, t.number, tt.code as tx_type
    FROM einvoice_docs d
    LEFT JOIN transactions t ON d.tx_id = t.id
    LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
    WHERE d.status != 'aceptada'
    ORDER BY d.sent_at DESC
    LIMIT 10
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Query error:", err);
      return;
    }
    console.log("=== REJECTED OR PENDING DOCUMENTS ===");
    rows.forEach(row => {
      console.log(`\nDoc ID: ${row.id}`);
      console.log(`Tx ID: ${row.tx_id} | Num: ${row.number} | Type: ${row.tx_type}`);
      console.log(`Status: ${row.status} | Sent At: ${row.sent_at}`);
      console.log(`Response: ${row.dian_response}`);
    });
  });
});
