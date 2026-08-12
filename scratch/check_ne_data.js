const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}
async function main() {
  // Get a real payroll_line to see what 'notes' contains (the payroll_meta JSON)
  const lines = await query('SELECT * FROM payroll_lines LIMIT 2');
  lines.forEach(l => {
    console.log('\n--- payroll_line ---');
    console.log('notes (meta):', l.notes ? l.notes.slice(0, 300) : 'NULL');
    console.log('salary_base:', l.salary_base, ' | days_worked:', l.days_worked);
    console.log('overtime:', l.overtime, ' | transport_allowance:', l.transport_allowance);
    console.log('deduction_health:', l.deduction_health, ' | deduction_pension:', l.deduction_pension);
    console.log('solidarity_fund:', l.solidarity_fund, ' | withholding_tax:', l.withholding_tax);
    console.log('employee_id:', l.employee_id, ' | period_id:', l.period_id);
  });
  // Get a real electronic_payroll
  const eps = await query('SELECT * FROM electronic_payrolls LIMIT 1');
  if (eps.length) {
    const ep = eps[0];
    console.log('\n--- electronic_payroll sample ---');
    console.log('xml (first 200):', (ep.xml_generado || '').slice(0, 200));
    console.log('employee_id:', ep.employee_id, '| ano:', ep.ano, '| mes:', ep.mes);
  }
  // Get company settings
  const settings = await query("SELECT key, value FROM settings WHERE key IN ('company', 'company_name', 'company_nit', 'company_rules')");
  settings.forEach(s => console.log('\nsetting:', s.key, '=', (s.value || '').slice(0, 200)));
  db.close();
}
main().catch(console.error);
