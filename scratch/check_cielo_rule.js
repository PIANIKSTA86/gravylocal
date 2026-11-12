const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cielo = db.prepare("SELECT id, name, notes FROM third_parties WHERE id = ?").get('v21xfu4abpcba2f');
console.log('Cielo third party:', cielo);

const settings = db.prepare("SELECT value FROM settings WHERE key = 'company_rules'").get();
if (settings) {
  const rules = JSON.parse(settings.value);
  const empRule = (rules.employees || []).find(e => e.employee_id === 'v21xfu4abpcba2f');
  console.log('Employee payroll rule for Cielo:', empRule);
}

