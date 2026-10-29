const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

console.log('=== AUDITORIA NOMINA ORDINARIA VS NOMINA ELECTRONICA (JUL - SEP 2026) ===\n');

// 1. Periods
const periods = db.prepare(`
  SELECT id, name, date_from, date_to, status 
  FROM payroll_periods 
  WHERE date_from >= '2026-07-01' AND date_from <= '2026-09-30'
  ORDER BY date_from
`).all();
console.log('Períodos de Nómina en Jul - Sep 2026:', periods);

// 2. Electronic Payroll records for Jul, Aug, Sep
const neRecords = db.prepare(`
  SELECT id, ano, mes, consecutivo, prefijo, employee_id, total_devengos, total_deducciones, total_neto, total_empleador, estado_dian, fecha_envio, cufe
  FROM electronic_payrolls
  WHERE ano = 2026 AND mes IN (7, 8, 9)
  ORDER BY mes, consecutivo
`).all();
console.log(`\nRegistros de Nómina Electrónica encontrados (${neRecords.length}):`);
console.table(neRecords);

// 3. Payroll Lines grouped by month and employee
const lines = db.prepare(`
  SELECT 
    pl.id as line_id,
    pl.period_id,
    pp.name as period_name,
    pp.date_from,
    pp.date_to,
    pl.employee_id,
    tp.name as emp_name,
    tp.doc_number,
    pl.days_worked,
    pl.salary_base,
    pl.transport_allowance,
    pl.overtime,
    pl.deduction_health,
    pl.deduction_pension,
    pl.deduction_other,
    pl.solidarity_fund,
    pl.withholding_tax,
    pl.cesantias,
    pl.intereses_ces,
    pl.prima,
    pl.vacaciones,
    pl.employer_health,
    pl.employer_pension,
    pl.employer_arl,
    pl.sena,
    pl.icbf,
    pl.caja_comp,
    pl.net_pay,
    pl.notes
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  LEFT JOIN third_parties tp ON tp.id = pl.employee_id
  WHERE pp.date_from >= '2026-07-01' AND pp.date_from <= '2026-09-30'
  ORDER BY pp.date_from, tp.name
`).all();

console.log(`\nTotal líneas de nómina ordinaria en Jul - Sep 2026: ${lines.length}`);
