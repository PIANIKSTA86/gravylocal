const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const empresasDir = path.resolve('empresas');
const entries = fs.readdirSync(empresasDir, { withFileTypes: true });

for (const e of entries) {
  if (e.isDirectory() && e.name.startsWith('empresa_')) {
    const dbPath = path.join(empresasDir, e.name, 'pb_data', 'data.db');
    if (fs.existsSync(dbPath)) {
      try {
        const db = new DatabaseSync(dbPath, { open: true, readOnly: true });
        const hasPh = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_properties'").get();
        if (hasPh) {
          const compName = db.prepare("SELECT value FROM settings WHERE key='company_name'").get()?.value || e.name;
          const propCount = db.prepare("SELECT count(*) as c FROM ph_properties").get()?.c || 0;
          console.log(`[${e.name}] ${compName} - PH Properties: ${propCount}`);
        }
        db.close();
      } catch(err) {
        console.log(`[${e.name}] Error opening: ${err.message}`);
      }
    }
  }
}
