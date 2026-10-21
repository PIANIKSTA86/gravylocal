const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT * FROM geo_municipalities LIMIT 10", (err, rows) => {
  if (err) {
    console.error('Error querying geo_municipalities:', err.message);
  } else {
    console.log('geo_municipalities count/sample:', rows.length, rows.slice(0, 3));
  }
  db.close();
});
