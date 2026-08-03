const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

function dumpTable(db, tableName) {
  try {
    const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT 10`).all();
    console.log(`Table ${tableName}:`, rows);
  } catch (e) {
    console.log(`Error reading table ${tableName}:`, e.message);
  }
}

console.log("=== HUB DATABASE ===");
if (fs.existsSync('hub/pb_data/data.db')) {
  try {
    const db = new DatabaseSync('hub/pb_data/data.db');
    dumpTable(db, '_superusers');
    dumpTable(db, 'hub_users');
    dumpTable(db, 'companies');
    dumpTable(db, 'user_company_access');
  } catch (err) {
    console.error("Error reading HUB database:", err);
  }
}

console.log("\n=== EMPRESA DEMO DATABASE ===");
if (fs.existsSync('pb_data/data.db')) {
  try {
    const db = new DatabaseSync('pb_data/data.db');
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Tables in Demo database:", tables.map(t => t.name).join(', '));
    
    dumpTable(db, '_superusers');
    dumpTable(db, 'users');
  } catch (err) {
    console.error("Error reading Demo database:", err);
  }
}
