const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

if (fs.existsSync('pb_data/data.db')) {
  try {
    const db = new DatabaseSync('pb_data/data.db');
    const statusCounts = db.prepare("SELECT status, COUNT(*) as count FROM transactions GROUP BY status").all();
    console.log("Transaction status counts:", statusCounts);
  } catch (err) {
    console.error("Error reading database:", err);
  }
} else {
  console.log("pb_data/data.db does not exist");
}
