const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cieloId = 'v21xfu4abpcba2f';

console.log('=== NOM-368 (id: u4mpu73bpvpb6qu) ===');
const nom368 = db.prepare("SELECT * FROM electronic_payrolls WHERE id = 'u4mpu73bpvpb6qu'").get();
console.log('NOM-368 XML/JSON length:', nom368.xml_generado.length);
try {
  const parsed = JSON.parse(nom368.xml_generado);
  console.log('NOM-368 Earn:', JSON.stringify(parsed.earn, null, 2));
  console.log('NOM-368 Deductions:', JSON.stringify(parsed.deductions, null, 2));
} catch (e) {
  console.log('Error parsing NOM-368 JSON:', e);
}

console.log('\n=== PAYROLL LINES FOR CIELO IN SEPTEMBER 2026 ===');
const septPeriods = db.prepare("SELECT id, name, date_from, date_to FROM payroll_periods WHERE date_from LIKE '2026-09%' OR date_to LIKE '2026-09%'").all();
console.log('Sept periods:', septPeriods);
for (const p of septPeriods) {
  const pl = db.prepare("SELECT * FROM payroll_lines WHERE period_id = ? AND employee_id = ?").get(p.id, cieloId);
  console.log(`Line for period ${p.name}:`, pl);
}

console.log('\n=== NOVELTIES FOR CIELO IN SEPTEMBER 2026 ===');
const septNovs = db.prepare("SELECT * FROM payroll_novelties WHERE employee_id = ? AND (date_from LIKE '2026-09%' OR date_to LIKE '2026-09%' OR period_id IN (?, ?))").all(cieloId, septPeriods[0]?.id, septPeriods[1]?.id);
console.log('Sept novelties:', septNovs);

console.log('\n=== NOVELTIES FOR CIELO IN ALL PERIODS ===');
const allNovs = db.prepare("SELECT * FROM payroll_novelties WHERE employee_id = ?").all(cieloId);
console.table(allNovs);

console.log('\n=== SEARCHING FOR 80000 ACROSS ALL DB COLUMNS ===');
const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const t of allTables) {
  const tableName = t.name;
  if (tableName.startsWith('_') || tableName.startsWith('sqlite')) continue;
  try {
    const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
    for (const c of cols) {
      const rows = db.prepare(`SELECT * FROM ${tableName} WHERE CAST(${c.name} AS TEXT) LIKE '%80000%' OR CAST(${c.name} AS TEXT) LIKE '%80.000%'`).all();
      if (rows.length > 0) {
        console.log(`Found ${rows.length} matches in ${tableName}.${c.name}:`);
        rows.slice(0, 3).forEach(r => console.log('  ', r.id, r.employee_id || r.third_party_id || r.name || r.number || ''));
      }
    }
  } catch (err) {}
}

