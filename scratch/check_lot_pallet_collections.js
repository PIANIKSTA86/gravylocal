const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT name FROM _collections", (err, rows) => {
  if (err) return console.error(err);
  const matched = rows.filter(r => /lot|pallet|estiba|inv/i.test(r.name)).map(r => r.name);
  console.log("Matched collections:", matched);

  // Print schemas of inventory_pallets, import_pallet_configs, and any lot tables if exist
  matched.forEach(colName => {
    db.get("SELECT fields FROM _collections WHERE name = ?", [colName], (err2, colRow) => {
      if (colRow) {
        const f = JSON.parse(colRow.fields || '[]');
        console.log(`\n=== COLLECTION: ${colName} ===`);
        f.forEach(item => console.log(`  ${item.name} (${item.type})`));
      }
    });
  });
  setTimeout(() => db.close(), 1500);
});
