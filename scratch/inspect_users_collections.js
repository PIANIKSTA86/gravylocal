const sqlite3 = require('sqlite3').verbose();
const paths = {
  hub: 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db',
  demo: 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db',
  empresa_8091: 'c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/empresa_8091/pb_data/data.db'
};

for (const [key, dbPath] of Object.entries(paths)) {
  const db = new sqlite3.Database(dbPath);
  db.get("SELECT fields FROM _collections WHERE name='users'", (err, row) => {
    if (err) {
      console.error(`[${key}] Error:`, err.message);
    } else if (row) {
      try {
        const fields = JSON.parse(row.fields);
        const roleField = fields.find(f => f.name === 'role');
        console.log(`[${key}] users.role select values:`, roleField ? roleField.values : 'role field not found');
      } catch (e) {
        console.error(`[${key}] JSON parse error:`, e.message);
      }
    } else {
      console.log(`[${key}] Collection 'users' not found`);
    }
    db.close();
  });
}
