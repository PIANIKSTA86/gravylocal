const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const dirs = ['pb_data', 'empresas/empresa_8091/pb_data', 'empresas/empresa_8092/pb_data', 'empresas/empresa_8093/pb_data', 'empresas/empresa_8094/pb_data'];

for (const d of dirs) {
  const dbPath = path.join(d, 'data.db');
  if (fs.existsSync(dbPath)) {
    try {
      const db = new DatabaseSync(dbPath, { readOnly: true });
      const row = db.prepare("SELECT id, number FROM transactions WHERE number LIKE '%FE-00000009%' OR number LIKE '%FE9%'").get();
      if (row) {
        console.log("Found in", d, row);
      }
      db.close();
    } catch(e) {
      console.log("Error in", d, e.message);
    }
  }
}
