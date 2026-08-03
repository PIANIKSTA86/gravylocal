const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  const settings = db.prepare("SELECT value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_mappings_part_%'").all();
  let mappingsStr = settings.map(r => r.value).join('');
  const mappings = mappingsStr ? JSON.parse(mappingsStr) : [];
  
  console.log("Mappings de ingresos adicionales (novedades):");
  const filtered = mappings.filter(m => !['salary_base', 'net_pay', 'transport_allowance', 'deduction_health', 'deduction_pension', 'employer_health', 'employer_pension', 'employer_arl', 'sena', 'icbf', 'caja_comp', 'cesantias', 'intereses_ces', 'prima', 'vacaciones'].includes(m.concept));
  
  filtered.forEach(m => {
    const acc = db.prepare('SELECT code, name FROM accounts WHERE id = ?').get(m.account_id);
    const accStr = acc ? `${acc.code} - ${acc.name}` : m.account_id;
    console.log(`Concepto: ${m.concept} | Lado: ${m.side} | Cuenta: ${accStr} | Activo: ${m.active}`);
  });
}

run();
