const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');
db.all("SELECT name, fields FROM _collections WHERE name IN ('inventory_movements', 'inventory_movement_lines', 'products', 'inventory_lots', 'product_batches')", (err, rows) => {
  if (err) console.error(err);
  else {
    rows.forEach(r => {
      console.log('COLLECTION:', r.name);
      try {
        const f = JSON.parse(r.fields);
        console.log(f.map(x => x.name + ' (' + x.type + ')').join(', '));
      } catch(e) { console.error(e); }
    });
  }
  db.close();
});
