const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT fields FROM _collections WHERE name='niif_assets'", (err, row) => {
  if (err) return console.error(err);
  const fields = JSON.parse(row.fields);
  const reqs = fields.filter(f => f.required);
  console.log("Required fields:", reqs.map(f => ({ name: f.name, type: f.type, required: f.required })));
});
