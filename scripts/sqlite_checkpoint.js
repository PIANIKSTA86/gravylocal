/**
 * GRAVY v2.0 — sqlite_checkpoint.js
 * Ejecuta PRAGMA wal_checkpoint(TRUNCATE) en todas las bases de datos de SQLite
 * para consolidar los diarios WAL en los archivos data.db principales antes de respaldar.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const BASE_DIR = path.resolve(__dirname, '..');

function checkpointDb(dbPath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(dbPath)) return resolve({ path: dbPath, skipped: true });

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.warn(`  [!] No se pudo abrir ${path.basename(dbPath)} para checkpoint: ${err.message}`);
        return resolve({ path: dbPath, success: false, error: err.message });
      }

      db.run('PRAGMA wal_checkpoint(TRUNCATE);', (cpErr) => {
        db.close();
        if (cpErr) {
          console.warn(`  [!] Error en checkpoint de ${path.basename(dbPath)}: ${cpErr.message}`);
          return resolve({ path: dbPath, success: false, error: cpErr.message });
        }
        console.log(`  [OK] Checkpoint exitoso en ${path.relative(BASE_DIR, dbPath)}`);
        return resolve({ path: dbPath, success: true });
      });
    });
  });
}

async function main() {
  console.log('[GRAVY CHECKPOINT] Consolidando diarios WAL de SQLite...');

  const dbFiles = ['data.db', 'auxiliary.db', 'logs.db'];
  const targets = [];

  // 1. Instancia principal
  for (const f of dbFiles) {
    targets.push(path.join(BASE_DIR, 'pb_data', f));
  }

  // 2. Instancia HUB
  for (const f of dbFiles) {
    targets.push(path.join(BASE_DIR, 'hub', 'pb_data', f));
  }

  // 3. Sub-empresas
  const empresasDir = path.join(BASE_DIR, 'empresas');
  if (fs.existsSync(empresasDir)) {
    const items = fs.readdirSync(empresasDir);
    for (const item of items) {
      const itemPath = path.join(empresasDir, item);
      if (fs.statSync(itemPath).isDirectory() && /^empresa_\d+$/.test(item)) {
        for (const f of dbFiles) {
          targets.push(path.join(itemPath, 'pb_data', f));
        }
      }
    }
  }

  let successCount = 0;
  for (const target of targets) {
    const res = await checkpointDb(target);
    if (res.success) successCount++;
  }

  console.log(`[GRAVY CHECKPOINT] Finalizado. (${successCount} bases de datos sincronizadas).`);
}

main().catch((err) => {
  console.error('[GRAVY CHECKPOINT ERROR]', err);
  process.exit(1);
});
