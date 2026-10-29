const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('hub/pb_data/data.db');

db.get("SELECT * FROM _collections WHERE name='licenses'", (err, row) => {
  if (err) {
    console.error('Error querying hub _collections:', err);
    return;
  }
  if (!row) {
    console.log('licenses collection not found in hub');
    return;
  }
  const fields = typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields;
  const mf = fields.find(f => f.name === 'module_key');
  console.log('HUB fields module_key values:', mf ? mf.values : 'no module_key in fields');
});
