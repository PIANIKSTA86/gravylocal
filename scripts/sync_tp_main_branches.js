const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath);

function randomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

db.serialize(() => {
  // 1. Verificar si existe la tabla third_party_branches
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='third_party_branches'", (err, row) => {
    if (err || !row) {
      console.log('Tabla third_party_branches no existe aun en SQLite. Se creara cuando inicie PocketBase o via migracion.');
      db.close();
      return;
    }

    // 2. Obtener todos los terceros
    db.all("SELECT * FROM third_parties", (err, tps) => {
      if (err) {
        console.error('Error leyendo third_parties:', err);
        db.close();
        return;
      }

      console.log(`Analizando ${tps.length} terceros existentes para inicializar sede principal...`);
      let insertedCount = 0;

      const checkStmt = db.prepare("SELECT id FROM third_party_branches WHERE third_party_id = ?");
      const insertStmt = db.prepare(`
        INSERT INTO third_party_branches (
          id, third_party_id, code, name, is_main, country, department, dept_code,
          city, city_code, address, phone, phone2, email, contact_name, advisor,
          advisor_name, pi, notes, active, created, updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      let processed = 0;
      tps.forEach(tp => {
        checkStmt.get(tp.id, (chkErr, branchRow) => {
          if (!chkErr && !branchRow) {
            const branchId = randomId();
            insertStmt.run(
              branchId,
              tp.id,
              '001',
              'Sede Principal',
              1, // is_main = true
              tp.country || 'CO',
              tp.department || '',
              tp.dept_code || '',
              tp.city || '',
              tp.city_code || '',
              tp.address || '',
              tp.phone || '',
              tp.phone2 || '',
              tp.email || '',
              tp.contact_name || '',
              tp.advisor || '',
              tp.advisor_name || '',
              tp.pi || 0,
              'Sede principal generada automáticamente',
              tp.active !== 0 ? 1 : 0
            );
            insertedCount++;
          }
          processed++;
          if (processed === tps.length) {
            checkStmt.finalize();
            insertStmt.finalize();
            console.log(`Sincronización completa: ${insertedCount} sedes principales creadas.`);
            db.close();
          }
        });
      });
    });
  });
});
