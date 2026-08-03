const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  const keys = db.prepare("SELECT key, length(value) as len FROM settings").all();
  console.log("Claves de configuración encontradas:", keys);
}

run();
