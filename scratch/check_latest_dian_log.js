const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT * FROM dian_logs ORDER BY created_at DESC LIMIT 1", (err, row) => {
  if (err || !row) {
    console.log("No dian_logs found or err:", err);
    db.close();
    return;
  }
  console.log("=== LATEST DIAN LOG ===");
  console.log("Created at:", row.created_at);
  console.log("Endpoint:", row.endpoint);
  console.log("Status Code:", row.status_code);
  console.log("Success:", row.success);
  console.log("\n--- REQUEST PAYLOAD ---");
  console.log(typeof row.request_payload === 'string' ? row.request_payload : JSON.stringify(row.request_payload, null, 2));
  console.log("\n--- RESPONSE PAYLOAD ---");
  console.log(typeof row.response_payload === 'string' ? row.response_payload : JSON.stringify(row.response_payload, null, 2));
  db.close();
});

