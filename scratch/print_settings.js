const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    const settings = db.prepare("SELECT * FROM settings").all();
    let out = "=== FILTERED SETTINGS ===\n";
    for (const row of settings) {
      const k = String(row.key).toLowerCase();
      if (k.includes("nit") || k.includes("company") || k.includes("dian") || k.includes("dv") || k.includes("ftech")) {
        out += `${row.key}: ${row.value}\n`;
      }
    }
    fs.writeFileSync(path.resolve(__dirname, 'settings_output.txt'), out, 'utf8');
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
