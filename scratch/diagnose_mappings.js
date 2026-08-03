const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  const settings = db.prepare("SELECT value FROM settings WHERE key LIKE 'nomina_config%' LIMIT 1").get();
  if (settings) {
    console.log("Configuración contable de nómina (mappings):");
    const val = JSON.parse(settings.value);
    console.log(JSON.stringify(val.mappings, null, 2));
  }
}

run();
