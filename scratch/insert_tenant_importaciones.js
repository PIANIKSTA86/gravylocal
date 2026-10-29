const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('pb_data/data.db');

db.all("PRAGMA table_info(licenses)", (err, columns) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Tenant licenses columns:", columns.map(c => c.name));
  const colNames = columns.map(c => c.name);

  function randomId(len = 15) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  }

  db.get("SELECT id FROM licenses WHERE module_key='importaciones'", (selErr, row) => {
    if (selErr) {
      console.error(selErr);
      return;
    }
    if (!row) {
      const id = randomId(15);
      const cols = ['id', 'module_key', 'enabled', 'plan'];
      const vals = [id, 'importaciones', 1, 'perpetua'];
      if (colNames.includes('created')) {
        cols.push('created');
        vals.push(new Date().toISOString());
      }
      if (colNames.includes('updated')) {
        cols.push('updated');
        vals.push(new Date().toISOString());
      }
      const placeholders = cols.map(() => '?').join(', ');
      db.run(`INSERT INTO licenses (${cols.join(', ')}) VALUES (${placeholders})`, vals, function(insErr) {
        if (insErr) console.error('Error inserting license:', insErr);
        else console.log('Successfully inserted importaciones license into tenant DB with id:', id);
      });
    } else {
      db.run("UPDATE licenses SET enabled = 1 WHERE module_key = 'importaciones'", function(updErr) {
        if (updErr) console.error('Error updating license:', updErr);
        else console.log('Successfully enabled importaciones license in tenant DB');
      });
    }
  });
});
