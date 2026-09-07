const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');
db.get("SELECT fields FROM _collections WHERE name = 'import_pallet_configs'", (err, row) => {
  if (err) console.error(err);
  else {
    console.log('PALLET CONFIG FIELDS:');
    JSON.parse(row.fields).forEach(f => console.log('  -', f.name, '(' + f.type + ')'));
  }
  db.get("SELECT fields FROM _collections WHERE name = 'import_lines'", (err2, row2) => {
    if (err2) console.error(err2);
    else {
      console.log('IMPORT LINES FIELDS:');
      JSON.parse(row2.fields).forEach(f => console.log('  -', f.name, '(' + f.type + ')'));
    }
    db.get("SELECT fields FROM _collections WHERE name = 'products'", (err3, row3) => {
      if (err3) console.error(err3);
      else {
        console.log('PRODUCTS FIELDS:');
        JSON.parse(row3.fields).forEach(f => console.log('  -', f.name, '(' + f.type + ')'));
      }
      db.close();
    });
  });
});
