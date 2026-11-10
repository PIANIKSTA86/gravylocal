const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Check periods in September 2026
const sepPeriods = db.prepare("SELECT * FROM payroll_periods WHERE date_from LIKE '2026-09%' OR date_to LIKE '2026-09%'").all();
console.log('September Periods:');
sepPeriods.forEach(p => console.log(`- ID: ${p.id}, Name: ${p.name}, From: ${p.date_from}, To: ${p.date_to}`));

// Check lines for Angelica in these periods
const sepPeriodIds = sepPeriods.map(p => `'${p.id}'`).join(',');
const lines = db.prepare(`SELECT * FROM payroll_lines WHERE employee_id = 'vsu8bz83547sxrn' AND period_id IN (${sepPeriodIds})`).all();
console.log(`\nLines for Angelica in September (${lines.length}):`);
lines.forEach(l => {
  console.log(`- Period: ${l.period_id}, Days: ${l.days_worked}, Transp: ${l.transport_allowance}`);
  console.log(`  Notes:`, JSON.parse(l.notes));
});

// Check NOM-366 in full
const ep = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 366").get();
console.log('\nNOM-366 full xml_generado:');
console.log(ep.xml_generado);

