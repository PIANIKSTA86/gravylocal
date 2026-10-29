const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const line = db.prepare(`
  SELECT pl.*, tp.name as emp_name, tp.doc_number 
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  JOIN third_parties tp ON tp.id = pl.employee_id
  WHERE pp.name LIKE '%Junio 2026 — Q1%' AND tp.name LIKE '%CATALINA%'
`).get();

console.log('=== PAYROLL LINE FOR CATALINA MARTINEZ (Junio 2026 - Q1) ===');
console.log(line);
if (line && line.notes) {
  console.log('\n=== PARSED NOTES (payroll_meta) ===');
  console.log(JSON.stringify(JSON.parse(line.notes), null, 2));
}

// Also check novelties for Catalina in June Q1
const novs = db.prepare(`
  SELECT * FROM payroll_novelties 
  WHERE employee_id = ? AND (period_id = ? OR date_from LIKE '2026-06%')
`).all(line.employee_id, line.period_id);
console.log('\n=== NOVELTIES FOR CATALINA IN JUNE ===');
console.table(novs);

// Check employee configuration in settings or employee notes
const emp = db.prepare("SELECT * FROM third_parties WHERE id = ?").get(line.employee_id);
console.log('\n=== EMPLOYEE RECORD ===');
console.log('Name:', emp.name, 'Notes:', emp.notes);

// Check payroll settings
const settings = db.prepare("SELECT * FROM settings WHERE key LIKE '%payroll%' OR key LIKE '%company_rules%' OR key LIKE '%retencion%' OR key LIKE '%uvt%'").all();
console.log('\n=== SETTINGS ===');
settings.forEach(s => {
  console.log('KEY:', s.key);
  try {
    console.log(JSON.stringify(JSON.parse(s.value), null, 2));
  } catch(_) {
    console.log(s.value);
  }
});

