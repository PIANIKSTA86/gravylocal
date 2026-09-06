const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');
db.get("SELECT fields FROM _collections WHERE name = 'imports'", (err, row) => {
  if (err) console.error(err);
  else {
    const fields = JSON.parse(row.fields);
    console.log('IMPORTS FIELDS:');
    fields.forEach(f => console.log(`  - ${f.name} (${f.type})`));
  }
  db.close();
});
