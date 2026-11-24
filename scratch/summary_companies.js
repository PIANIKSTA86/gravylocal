const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dirs = [
  'pb_data',
  'empresas/empresa_8091/pb_data',
  'empresas/empresa_8092/pb_data',
  'empresas/empresa_8093/pb_data',
  'empresas/empresa_8094/pb_data',
  'empresas/empresa_8095/pb_data'
];

for (const d of dirs) {
  const dbPath = `${d}/data.db`;
  if (fs.existsSync(dbPath)) {
    try {
      const db = new DatabaseSync(dbPath);
      const name = db.prepare("SELECT value FROM settings WHERE key = 'company_name' OR key = 'general_company_name'").get();
      const accountsCount = db.prepare("SELECT COUNT(*) as cnt FROM accounts").get();
      const txCount = db.prepare("SELECT COUNT(*) as cnt FROM transactions").get();
      const linesCount = db.prepare("SELECT COUNT(*) as cnt FROM tx_lines").get();
      console.log(`[${d}] Empresa: "${name?.value}" | Cuentas: ${accountsCount.cnt} | Tx: ${txCount.cnt} | Líneas: ${linesCount.cnt}`);
    } catch (e) {
      console.log(`[${d}] Error: ${e.message}`);
    }
  }
}
