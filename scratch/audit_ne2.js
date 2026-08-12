const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
function q(sql) {
  return new Promise((res,rej) => db.all(sql, [], (e,r) => e ? rej(e) : res(r)));
}
async function run() {
  // Check payroll_periods - what are the 16 records?
  const periods = await q('SELECT * FROM payroll_periods LIMIT 5');
  console.log('\n=== payroll_periods (sample) ===');
  periods.forEach(p => console.log(JSON.stringify(p)));

  // Check third_parties employees
  const emps = await q('SELECT id, name, doc_number, doc_type, email, notes, bank_name, bank_account, first_name, last_name, city, department FROM third_parties LIMIT 6');
  console.log('\n=== third_parties ===');
  emps.forEach(e => console.log(JSON.stringify(e)));

  // Check payroll_documents - what schema?
  const docSchema = await q('PRAGMA table_info(payroll_documents)');
  console.log('\n=== payroll_documents schema ===');
  docSchema.forEach(c => console.log(c.name, '(' + c.type + ')'));

  // Check company settings
  const settings = await q('SELECT key, value FROM settings LIMIT 10');
  console.log('\n=== settings ===');
  settings.forEach(s => console.log(s.key, ':', s.value ? s.value.slice(0,150) : 'NULL'));

  db.close();
}
run().catch(e => { console.error(e.message); db.close(); });
