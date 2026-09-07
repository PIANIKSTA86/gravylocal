const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.get("SELECT fields FROM _collections WHERE name = 'imports'", (err, row) => {
  if (err) {
    console.error('Error fetching imports collection:', err);
    db.close();
    return;
  }
  const fields = JSON.parse(row.fields);
  const names = new Set(fields.map(f => f.name));
  let modified = false;

  if (!names.has('local_carrier_trm')) {
    fields.push({ name: 'local_carrier_trm', type: 'number', required: false, min: 0 });
    modified = true;
  }
  if (!names.has('local_other_trm')) {
    fields.push({ name: 'local_other_trm', type: 'number', required: false, min: 0 });
    modified = true;
  }

  if (modified) {
    db.run("UPDATE _collections SET fields = ? WHERE name = 'imports'", [JSON.stringify(fields)], (err2) => {
      if (err2) console.error('Error updating fields:', err2);
      else console.log('Successfully added local_carrier_trm and local_other_trm to imports collection!');
      
      // Also check SQLite table column
      db.all("PRAGMA table_info(imports)", (err3, cols) => {
        if (err3) console.error(err3);
        else {
          const colNames = new Set(cols.map(c => c.name));
          if (!colNames.has('local_carrier_trm')) {
            db.run("ALTER TABLE imports ADD COLUMN local_carrier_trm REAL DEFAULT 0", () => {
              console.log('Added column local_carrier_trm to SQLite table');
            });
          }
          if (!colNames.has('local_other_trm')) {
            db.run("ALTER TABLE imports ADD COLUMN local_other_trm REAL DEFAULT 0", () => {
              console.log('Added column local_other_trm to SQLite table');
              db.close();
            });
          } else {
            db.close();
          }
        }
      });
    });
  } else {
    console.log('Fields already exist.');
    db.close();
  }
});
