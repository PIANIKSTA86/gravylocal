const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const row = db.prepare("SELECT fields FROM _collections WHERE name = 'electronic_payrolls'").get();
if (row && row.fields) {
  const fields = JSON.parse(row.fields);
  console.log('electronic_payrolls fields:', fields.map(f => `${f.name} (${f.type})`));
}

