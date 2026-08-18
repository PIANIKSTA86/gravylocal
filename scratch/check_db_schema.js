const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../pb_data/data.db'));

db.get("SELECT * FROM _collections WHERE name = 'third_parties'", (err, row) => {
  if (err) {
    console.error('DB Error:', err);
  } else {
    const fields = JSON.parse(row.fields || row.schema || '[]');
    console.log(fields.map(f => `${f.name} (${f.type})`).join(', '));
  }
  db.close();
});
