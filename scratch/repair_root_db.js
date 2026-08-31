const { execSync } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const rootDb = path.resolve('pb_data', 'data.db');
const backupDb = path.resolve('pb_data', `data_corrupt_backup_${Date.now()}.db`);
const recoveredDb = path.resolve('pb_data', 'data_recovered.db');

console.log('--- Iniciando reparación de pb_data/data.db ---');

// 1. Crear backup de seguridad
fs.copyFileSync(rootDb, backupDb);
console.log('1. Backup creado en:', backupDb);

// 2. Usar dump y restore de SQLite para reparar el schema
try {
  // Intentar con python o sqlite o lectura limpia
  const dumpScript = path.resolve('scratch', 'dump_db.py');
  const pythonCode = `
import sqlite3
import sys

con = sqlite3.connect(r"${rootDb.replace(/\\/g, '\\\\')}")
with open(r"${path.resolve('scratch', 'dump.sql').replace(/\\/g, '\\\\')}", 'w', encoding='utf-8') as f:
    for line in con.iterdump():
        # Omitir indices huerfanos problematicos
        if 'sqlite_autoindex_inventory_concepts_1' in line:
            continue
        f.write('%s\\n' % line)
con.close()
print("Dump generado exitosamente.")
`;

  fs.writeFileSync(dumpScript, pythonCode, 'utf8');
  execSync(`python "${dumpScript}"`);

  // Crear la nueva DB desde el dump
  if (fs.existsSync(recoveredDb)) fs.unlinkSync(recoveredDb);
  const restoreCode = `
import sqlite3
con = sqlite3.connect(r"${recoveredDb.replace(/\\/g, '\\\\')}")
with open(r"${path.resolve('scratch', 'dump.sql').replace(/\\/g, '\\\\')}", 'r', encoding='utf-8') as f:
    sql = f.read()
con.executescript(sql)
con.close()
print("Restauración completada.")
`;
  const restoreScript = path.resolve('scratch', 'restore_db.py');
  fs.writeFileSync(restoreScript, restoreCode, 'utf8');
  execSync(`python "${restoreScript}"`);

  // Reemplazar data.db por la recuperada
  fs.copyFileSync(recoveredDb, rootDb);
  fs.unlinkSync(recoveredDb);
  console.log('2. pb_data/data.db reparada y reemplazada exitosamente.');

} catch (err) {
  console.error('Error durante la reparación con Python:', err.message);
}

// 3. Verificar integrity_check final
const db = new sqlite3.Database(rootDb);
db.all("PRAGMA integrity_check;", (err, rows) => {
  if (err) {
    console.error('Error final en integrity_check:', err.message);
  } else {
    console.log('Resultado integrity_check:', rows);
  }
  db.close();
});
