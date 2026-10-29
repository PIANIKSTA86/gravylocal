const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

console.log('=== CHECKING RECENT MODIFICATIONS IN AUDIT_LOG AND TABLES ===\n');

function checkRecent(dbPath, label) {
  if (!fs.existsSync(dbPath)) return;
  const db = new DatabaseSync(dbPath);
  console.log(`\n--- ${label} (${dbPath}) ---`);
  try {
    const logs = db.prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT 15").all();
    console.log('Recent audit logs:');
    console.table(logs.map(l => ({ action: l.action, entity: l.entity, details: l.details?.slice(0, 80), at: l.event_at })));
  } catch (e) {
    console.log('No audit_log or error:', e.message);
  }

  // Check recent payroll lines created or updated
  try {
    const pCols = db.prepare("PRAGMA table_info(payroll_lines)").all();
    const hasUpdated = pCols.some(c => c.name === 'updated');
    if (hasUpdated) {
      const recentLines = db.prepare("SELECT id, period_id, employee_id, updated FROM payroll_lines ORDER BY updated DESC LIMIT 5").all();
      console.log('Recent lines updated:', recentLines);
    }
  } catch (e) { console.log('Error checking lines:', e.message); }

  // Check recent payroll_periods
  try {
    const periods = db.prepare("SELECT id, name, date_from, date_to, status FROM payroll_periods ORDER BY date_from DESC LIMIT 10").all();
    console.log('Last 10 periods:');
    console.table(periods);
  } catch (e) {}

  // Check electronic_payrolls count and dates
  try {
    const eps = db.prepare("SELECT id, ano, mes, consecutivo, fecha_envio, estado_dian FROM electronic_payrolls ORDER BY id DESC LIMIT 10").all();
    console.log('Last 10 electronic_payrolls:');
    console.table(eps);
  } catch (e) {}
}

checkRecent('pb_data/data.db', 'ROOT Tenant (Puerto 8090)');
checkRecent('empresas/empresa_8091/pb_data/data.db', 'Tenant 8091');
