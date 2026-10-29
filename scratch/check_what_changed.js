const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const glob = require('path');

console.log('=== CHECKING ALL DATABASES FOR PAYROLL FROM JULY 2026 ===\n');

function inspectDb(dbPath, label) {
  if (!fs.existsSync(dbPath)) return;
  console.log(`\n======================================================`);
  console.log(`DATABASE: ${label} (${dbPath})`);
  const db = new DatabaseSync(dbPath);

  // Settings company
  try {
    const sName = db.prepare("SELECT value FROM settings WHERE key = 'company_name'").get();
    const sNit = db.prepare("SELECT value FROM settings WHERE key = 'company_nit'").get();
    console.log(`Empresa: ${sName?.value} (NIT: ${sNit?.value})`);
  } catch (e) { console.log('No settings table or error:', e.message); }

  // Periods from 2026-07
  try {
    const periods = db.prepare("SELECT id, name, date_from, date_to, status FROM payroll_periods WHERE date_from >= '2026-07-01' ORDER BY date_from").all();
    console.log(`Períodos desde 2026-07 (${periods.length}):`);
    console.table(periods);

    const lines = db.prepare(`
      SELECT pp.name as period, count(pl.id) as total_lines, sum(pl.days_worked) as total_days, sum(pl.salary_base) as total_base, sum(pl.net_pay) as total_net
      FROM payroll_lines pl
      JOIN payroll_periods pp ON pp.id = pl.period_id
      WHERE pp.date_from >= '2026-07-01'
      GROUP BY pp.id
      ORDER BY pp.date_from
    `).all();
    console.log('Líneas ordinarias agrupadas por período:');
    console.table(lines);

    const ne = db.prepare("SELECT ano, mes, count(id) as total_vouchers, sum(total_devengos) as sum_dev, sum(total_deducciones) as sum_ded, sum(total_neto) as sum_net FROM electronic_payrolls WHERE ano = 2026 AND mes >= 7 GROUP BY ano, mes ORDER BY ano, mes").all();
    console.log('Nómina electrónica agrupada por mes:');
    console.table(ne);
  } catch (e) {
    console.log('Error inspecting payroll tables:', e.message);
  }
}

inspectDb('pb_data/data.db', 'ROOT Tenant (Puerto 8090)');

// Also check any tenant under empresas/
const empresasDir = 'empresas';
if (fs.existsSync(empresasDir)) {
  const subdirs = fs.readdirSync(empresasDir);
  for (const s of subdirs) {
    inspectDb(`empresas/${s}/pb_data/data.db`, `Tenant: ${s}`);
  }
}
