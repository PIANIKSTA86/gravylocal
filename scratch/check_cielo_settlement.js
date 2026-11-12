const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

console.log('=== PRAGMA payroll_lines ===');
console.log(db.prepare("PRAGMA table_info(payroll_lines)").all().map(c => c.name));

console.log('\n=== RECENT ELECTRONIC PAYROLLS (all) ===');
const eps = db.prepare("SELECT id, employee_id, prefijo, consecutivo, ano, mes, total_devengos, total_deducciones, total_neto, estado_dian, cufe, created, updated FROM electronic_payrolls ORDER BY updated DESC LIMIT 15").all();
console.table(eps);

for (const ep of eps) {
  const emp = db.prepare("SELECT name FROM third_parties WHERE id = ?").get(ep.employee_id);
  console.log(`EP ${ep.prefijo}-${ep.consecutivo} (${ep.mes}/${ep.ano}): ${emp?.name} - State: ${ep.estado_dian}`);
}
