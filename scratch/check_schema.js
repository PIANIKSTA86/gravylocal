const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

['products', 'invoice_lines', 'inventory_movement_lines'].forEach(name => {
  db.get(`SELECT fields FROM _collections WHERE name = '${name}'`, (err, row) => {
    if (err) console.error(err);
    else if (row) {
      const fields = JSON.parse(row.fields);
      console.log(`${name.toUpperCase()} FIELDS:`);
      fields.forEach(f => console.log(`  - ${f.name} (${f.type})`));
    }
  });
});

setTimeout(() => db.close(), 1000);
