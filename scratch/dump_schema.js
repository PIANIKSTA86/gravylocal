const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db');

db.all("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule, fields FROM _collections", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    for (const row of rows) {
      console.log(`\n=========================================`);
      console.log(`Collection: ${row.name}`);
      console.log(`Rules: list=${row.listRule}, view=${row.viewRule}, create=${row.createRule}, update=${row.updateRule}, delete=${row.deleteRule}`);
      try {
        const fields = JSON.parse(row.fields);
        console.log(`Fields:`);
        fields.forEach(f => {
          console.log(`  - ${f.name} (${f.type})${f.required ? ' *' : ''}`);
        });
      } catch (e) {
        console.log(`Fields (raw): ${row.fields}`);
      }
    }
  }
  db.close();
});
