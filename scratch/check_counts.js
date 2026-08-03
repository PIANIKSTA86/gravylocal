const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function printCounts(dbPath, label) {
  try {
    const db = new DatabaseSync(dbPath);
    console.log(`\n=== COUNTS FOR: ${label} ===`);
    const tables = ['transactions', 'invoices', 'einvoice_docs', 'dian_resolutions', 'pos_shifts', 'pos_registers'];
    tables.forEach(t => {
      try {
        const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${t}`).get().cnt;
        console.log(`  ${t}: ${count}`);
      } catch (e) {
        console.log(`  ${t}: error (${e.message})`);
      }
    });
  } catch (err) {
    console.error(`Error reading ${label}:`, err.message);
  }
}

printCounts(path.resolve(__dirname, '..', 'pb_data', 'data.db'), "Demo (8090)");
printCounts(path.resolve(__dirname, '..', 'empresas', 'empresa_8091', 'pb_data', 'data.db'), "Empresa 4PATAS (8091)");
