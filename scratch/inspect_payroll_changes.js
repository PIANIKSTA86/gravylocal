const { DatabaseSync } = require('node:sqlite');

for (const dbPath of ['pb_data/data.db', 'empresas/empresa_8091/pb_data/data.db']) {
  console.log('\n======================================================');
  console.log('=== CHECKING DB:', dbPath);
  console.log('======================================================');
  try {
    const db = new DatabaseSync(dbPath);

    const periods = db.prepare(`
      SELECT p.id, p.name, p.date_from, p.date_to, p.status,
             COUNT(l.id) as lines_count,
             COALESCE(SUM(l.salary_base), 0) as tot_sal_base,
             COALESCE(SUM(l.transport_allowance), 0) as tot_transp,
             COALESCE(SUM(l.overtime), 0) as tot_overtime,
             COALESCE(SUM(l.deduction_health), 0) as tot_health,
             COALESCE(SUM(l.deduction_pension), 0) as tot_pension,
             COALESCE(SUM(l.solidarity_fund), 0) as tot_fsp,
             COALESCE(SUM(l.withholding_tax), 0) as tot_rf,
             COALESCE(SUM(l.net_pay), 0) as tot_net
      FROM payroll_periods p
      LEFT JOIN payroll_lines l ON l.period_id = p.id
      WHERE p.date_from >= '2026-07-01'
      GROUP BY p.id
      ORDER BY p.date_from ASC
    `).all();
    console.log('\n--- PERIODS FROM JULY 2026 ---');
    console.table(periods);
    
    const epSummary = db.prepare(`
      SELECT ano, mes, count(*) as count, 
             sum(devengados_total) as tot_dev, 
             sum(deducciones_total) as tot_ded, 
             sum(comprobante_total) as tot_net 
      FROM electronic_payrolls 
      WHERE ano = 2026 AND mes >= 7 
      GROUP BY ano, mes 
      ORDER BY mes ASC
    `).all();
    console.log('\n--- ELECTRONIC PAYROLL SUMMARY BY MONTH ---');
    console.table(epSummary);

    const novCols = db.prepare("PRAGMA table_info(payroll_novelties)").all().map(c => c.name);
    console.log('\npayroll_novelties cols:', novCols.join(', '));

    const novelties = db.prepare(`SELECT * FROM payroll_novelties LIMIT 50`).all();
    console.log('\n--- ALL NOVELTIES COUNT:', novelties.length);
    if (novelties.length > 0) {
      console.table(novelties.map(n => ({
        id: n.id,
        emp: n.employee_id || n.employee,
        type: n.novelty_type || n.type,
        start: n.start_date || n.date_start || n.date,
        end: n.end_date || n.date_end,
        amount: n.amount,
        status: n.status
      })));
    }

  } catch (e) {
    console.error('Error on', dbPath, e.message);
  }
}
