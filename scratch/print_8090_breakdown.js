const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const periods = db.prepare(`
  SELECT id, name, date_from, date_to, status
  FROM payroll_periods
  WHERE date_from >= '2026-07-01'
  ORDER BY date_from ASC
`).all();

for (let m = 7; m <= 10; m++) {
  const monthStr = String(m).padStart(2, '0');
  const mPeriods = periods.filter(p => p.date_from.startsWith(`2026-${monthStr}`) || p.date_to.startsWith(`2026-${monthStr}`));

  console.log(`\n========================================================================================`);
  console.log(`>>> PORT 8090 | MONTH ${m} / 2026 - Periods: ${mPeriods.map(p => p.name).join(', ')}`);
  console.log(`========================================================================================`);

  if (mPeriods.length === 0) continue;

  const periodIds = mPeriods.map(p => `'${p.id}'`).join(',');
  const lines = db.prepare(`
    SELECT l.*, 
           COALESCE(t.name, t.first_name || ' ' || t.last_name) as emp_name,
           t.doc_number
    FROM payroll_lines l
    LEFT JOIN third_parties t ON t.id = l.employee_id
    WHERE l.period_id IN (${periodIds})
  `).all();

  const byEmp = {};
  for (const l of lines) {
    if (!byEmp[l.employee_id]) {
      byEmp[l.employee_id] = {
        name: l.emp_name,
        doc: l.doc_number,
        salary_base: 0,
        transport: 0,
        overtime: 0,
        vacaciones: 0,
        prima: 0,
        cesantias: 0,
        intereses: 0,
        health: 0,
        pension: 0,
        fsp: 0,
        rf: 0,
        other_ded: 0,
        net_pay: 0,
        notes_objs: []
      };
    }
    const e = byEmp[l.employee_id];
    e.salary_base += (l.salary_base || 0);
    e.transport += (l.transport_allowance || 0);
    e.overtime += (l.overtime || 0);
    e.vacaciones += (l.vacaciones || 0);
    e.prima += (l.prima || 0);
    e.cesantias += (l.cesantias || 0);
    e.intereses += (l.intereses_ces || 0);
    e.health += (l.deduction_health || 0);
    e.pension += (l.deduction_pension || 0);
    e.fsp += (l.solidarity_fund || 0);
    e.rf += (l.withholding_tax || 0);
    e.other_ded += (l.deduction_other || 0);
    e.net_pay += (l.net_pay || 0);
    if (l.notes) {
      try { e.notes_objs.push(JSON.parse(l.notes)); } catch (_) {}
    }
  }

  const monthEp = db.prepare(`
    SELECT ep.*, 
           COALESCE(t.name, t.first_name || ' ' || t.last_name) as emp_name
    FROM electronic_payrolls ep
    LEFT JOIN third_parties t ON t.id = ep.employee_id
    WHERE ep.ano = 2026 AND ep.mes = ?
  `).all(m);

  for (const [empId, data] of Object.entries(byEmp)) {
    const ep = monthEp.find(r => r.employee_id === empId);

    let extraDev = 0;
    let extraDed = 0;
    for (const no of data.notes_objs) {
      if (no.devengos_adicionales) {
        for (const [k, v] of Object.values(no.devengos_adicionales)) extraDev += (Number(v) || 0);
      }
      if (no.deducciones_adicionales) {
        for (const [k, v] of Object.values(no.deducciones_adicionales)) extraDed += (Number(v) || 0);
      }
    }

    const ordDev = data.salary_base + data.transport + data.overtime + data.vacaciones + data.prima + data.cesantias + data.intereses + extraDev;
    const ordDed = data.health + data.pension + data.fsp + data.rf + data.other_ded + extraDed;
    const ordNet = data.net_pay;

    const epDev = ep ? ep.total_devengos : null;
    const epDed = ep ? ep.total_deducciones : null;
    const epNet = ep ? ep.total_neto : null;

    console.log(
      `${(data.name || '').padEnd(30)} | CC: ${(data.doc || '').padEnd(10)} | ` +
      `Ord Dev: ${ordDev.toFixed(2).padStart(11)} | NE Dev: ${epDev !== null ? epDev.toFixed(2).padStart(11) : '        N/A'} | ` +
      `Ord Ded: ${ordDed.toFixed(2).padStart(10)} | NE Ded: ${epDed !== null ? epDed.toFixed(2).padStart(10) : '       N/A'} | ` +
      `Ord Net: ${ordNet.toFixed(2).padStart(11)} | NE Net: ${epNet !== null ? epNet.toFixed(2).padStart(11) : '        N/A'} | ` +
      `DiffNet: ${epNet !== null ? (ordNet - epNet).toFixed(2).padStart(8) : '  SIN_NE'} | ` +
      `Doc: ${ep ? `${ep.prefijo}-${ep.consecutivo}` : 'N/A'}`
    );
  }
}
