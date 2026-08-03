const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM _collections WHERE name NOT LIKE '\\_%' ESCAPE '\\' ORDER BY name", (err, rows) => {
  if (err) {
    console.error("Error reading database collections:", err);
    process.exit(1);
  }

  const dbCollectionNames = rows.map(r => r.name);
  console.log(`Total non-system collections in SQLite database: ${dbCollectionNames.length}`);

  // Read utilidades.ts to extract BACKUP_COLLECTIONS
  const utilidadesContent = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'src', 'modules', 'utilidades.ts'), 'utf-8');
  
  // Read restore.pb.js to extract ORDER
  const restoreContent = fs.readFileSync(path.join(__dirname, '..', 'pb_hooks', 'restore.pb.js'), 'utf-8');

  let missingInBackupUI = [];
  let missingInRestoreBackend = [];

  for (const name of dbCollectionNames) {
    if (!utilidadesContent.includes(`'${name}'`) && !utilidadesContent.includes(`"${name}"`)) {
      missingInBackupUI.push(name);
    }
    if (!restoreContent.includes(`'${name}'`) && !restoreContent.includes(`"${name}"`)) {
      missingInRestoreBackend.push(name);
    }
  }

  console.log("------------------------------------------------");
  console.log("Missing in BACKUP_COLLECTIONS (Frontend UI):", missingInBackupUI.length === 0 ? "NONE (100% COVERED!)" : missingInBackupUI);
  console.log("Missing in ORDER (Backend Restore Hook):", missingInRestoreBackend.length === 0 ? "NONE (100% COVERED!)" : missingInRestoreBackend);
  console.log("------------------------------------------------");

  if (missingInBackupUI.length === 0 && missingInRestoreBackend.length === 0) {
    console.log("VERIFICATION SUCCESSFUL: All database collections are fully covered in backup and restore!");
  } else {
    console.error("VERIFICATION FAILED: Some collections are missing.");
    process.exit(1);
  }
});
