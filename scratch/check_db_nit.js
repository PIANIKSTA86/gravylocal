const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8092', 'pb_data', 'data.db');
try {
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare('SELECT key, value FROM settings').all();
  console.log('Settings in empresa_8092:');
  rows.forEach(r => console.log(`  ${r.key} = ${r.value}`));

  const tenants = db.prepare('SELECT name, nit FROM company_info LIMIT 5').all();
  console.log('Company info:');
  tenants.forEach(t => console.log(t));
} catch (e) {
  console.error(e.message);
}
