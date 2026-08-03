const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT name FROM _collections", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    const names = rows.map(r => r.name);
    console.log("All collections:", names);
    const matching = names.filter(n => n.includes('cost') || n.includes('centro') || n.includes('area') || n.includes('actividad'));
    console.log("Matching search:", matching);
  }
  db.close();
});
