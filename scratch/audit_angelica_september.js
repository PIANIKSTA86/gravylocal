const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// 1. Find employee Angelica Moncada
const emp = db.prepare("SELECT * FROM third_parties WHERE name LIKE '%ANGELICA%MONCADA%'").get();
console.log('Employee:', emp ? { id: emp.id, name: emp.name, doc: emp.doc_number } : 'not found');

if (!emp) process.exit(0);

// 2. Find electronic_payrolls record for September 2026
const ep = db.prepare("SELECT * FROM electronic_payrolls WHERE employee_id = ? AND ano = 2026 AND mes = 9").get(emp.id);
console.log('\nElectronic Payroll record (NOM):', ep ? {
  id: ep.id,
  consecutivo: `${ep.prefijo}-${ep.consecutivo}`,
  estado_dian: ep.estado_dian,
  devengos: ep.total_devengos,
  deducciones: ep.total_deducciones,
  neto: ep.total_neto,
  xml_generado_len: ep.xml_generado?.length
} : 'not found');

// 3. Find payroll_lines for Angelica in September 2026
const lines = db.prepare("SELECT * FROM payroll_lines WHERE employee_id = ?").all(emp.id);
console.log(`\nFound ${lines.length} total payroll_lines for Angelica:`);
lines.forEach(l => {
  console.log(`- Line ID: ${l.id}, Period: ${l.period_id}, Days: ${l.days_worked}, Salary: ${l.salary}, Gross: ${l.gross_salary}, Net: ${l.net_salary}, Transp: ${l.transport_allowance}`);
  if (l.notes) console.log(`  Notes: ${l.notes}`);
});

// 4. Check payroll_novelties
const novs = db.prepare("SELECT * FROM payroll_novelties WHERE employee_id = ?").all(emp.id);
console.log(`\nFound ${novs.length} total novelties for Angelica:`);
novs.forEach(n => {
  console.log(`- Type: ${n.type}, DateFrom: ${n.date_from}, DateTo: ${n.date_to}, Amount: ${n.amount}, Notes: ${n.notes}`);
});

// 5. Check the JSON/XML generated for NOM-366
if (ep && ep.xml_generado) {
  console.log('\nContent of xml_generado for NOM-366 (first 1000 chars):');
  console.log(ep.xml_generado.slice(0, 1000));
}

