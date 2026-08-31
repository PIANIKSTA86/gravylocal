const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const rootDb = path.resolve('pb_data', 'data.db');
console.log('Reparando writable_schema en:', rootDb);

const db = new sqlite3.Database(rootDb, (err) => {
  if (err) {
    console.error('Error abriendo DB:', err);
    return;
  }

  db.serialize(() => {
    db.run("PRAGMA writable_schema = 1;", (err) => {
      console.log('writable_schema activado:', err ? err.message : 'OK');
    });

    db.run("DELETE FROM sqlite_master WHERE name = 'sqlite_autoindex_inventory_concepts_1' OR (tbl_name = 'inventory_concepts' AND type = 'index' AND sql IS NULL);", function(err) {
      console.log('Índices huérfanos eliminados:', err ? err.message : `Filas: ${this.changes}`);
    });

    db.run("PRAGMA writable_schema = 0;", (err) => {
      console.log('writable_schema desactivado:', err ? err.message : 'OK');
    });

    db.run("REINDEX;", (err) => {
      console.log('REINDEX:', err ? err.message : 'OK');
    });

    db.all("PRAGMA integrity_check;", (err, rows) => {
      console.log('Resultado integrity_check:', err ? err.message : rows);
      db.close();
    });
  });
});
