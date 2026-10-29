const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('hub/pb_data/data.db');

db.get("SELECT id, fields FROM _collections WHERE name='licenses'", (err, row) => {
  if (err) {
    console.error('Error querying hub _collections:', err);
    return;
  }
  if (!row) {
    console.log('licenses not found in hub');
    return;
  }

  const fields = JSON.parse(row.fields);
  const modField = fields.find(f => f.name === 'module_key');
  if (modField) {
    if (!modField.values.includes('importaciones')) {
      modField.values.push('importaciones');
      console.log('Adding importaciones to hub licenses module_key values');
      const updatedFieldsJson = JSON.stringify(fields);
      db.run("UPDATE _collections SET fields = ? WHERE id = ?", [updatedFieldsJson, row.id], function(updateErr) {
        if (updateErr) {
          console.error('Error updating hub _collections:', updateErr);
        } else {
          console.log('Successfully updated hub licenses schema in database. Changes:', this.changes);
        }
      });
    } else {
      console.log('importaciones already present in hub licenses');
    }
  } else {
    console.log('module_key field not found');
  }
});
