const { DatabaseSync } = require('node:sqlite');

function auditDatabase(dbPath, port) {
  console.log(`\n======================================================`);
  console.log(`AUDIT FOR: ${dbPath} (Port ${port})`);
  console.log(`======================================================`);
  const db = new DatabaseSync(dbPath);

  // 1. Electronic payroll summary
  const epRows = db.prepare(`
    SELECT ano, mes, count(*) as count, 
           sum(total_devengos) as tot_dev, 
           sum(total_deducciones) as tot_ded, 
           sum(total_neto) as tot_net 
    FROM electronic_payrolls 
    WHERE ano = 2026 AND mes >= 7 
    GROUP BY ano, mes 
    ORDER BY mes ASC
  `).all();
  console.log('\n--- ELECTRONIC PAYROLL SUMMARY BY MONTH ---');
  console.table(epRows);

  // 2. Periods from July 2026 onwards
  const periods = db.prepare(`
    SELECT id, name, date_from, date_to, status
    FROM payroll_periods
    WHERE date_from >= '2026-07-01'
    ORDER BY date_from ASC
  `).all();
  console.log('\n--- PERIODS FOUND ---');
  console.table(periods);

  // 3. For each month from 7 to 10
  for (let m = 7; m <= 10; m++) {
    const monthStr = String(m).padStart(2, '0');
    const mPeriods = periods.filter(p => p.date_from.startsWith(`2026-${monthStr}`) || p.date_to.startsWith(`2026-${monthStr}`));

    console.log(`\n======================================================`);
    console.log(`>>> MONTH ${m} / 2026 - Periods (${mPeriods.length}): ${mPeriods.map(p => p.name).join(', ')}`);
    console.log(`======================================================`);

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

    // Group lines by employee
    const byEmp = {};
    for (const l of lines) {
      if (!byEmp[l.employee_id]) {
        byEmp[l.employee_id] = {
          id: l.employee_id,
          name: l.emp_name,
          doc: l.doc_number,
          lines: [],
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
      e.lines.push(l);
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
        try {
          const parsed = JSON.parse(l.notes);
          e.notes_objs.push(parsed);
        } catch (_) {}
      }
    }

    // Electronic payroll for this month
    const monthEp = db.prepare(`
      SELECT ep.*, 
             COALESCE(t.name, t.first_name || ' ' || t.last_name) as emp_name
      FROM electronic_payrolls ep
      LEFT JOIN third_parties t ON t.id = ep.employee_id
      WHERE ep.ano = 2026 AND ep.mes = ?
    `).all(m);

    console.log(`Ordinary Employees = ${Object.keys(byEmp).length} | Electronic Payroll Records = ${monthEp.length}`);

    const comparisonTable = [];
    for (const [empId, data] of Object.entries(byEmp)) {
      const ep = monthEp.find(r => r.employee_id === empId);

      let extraDev = 0;
      let extraDed = 0;
      let extraDevDetails = [];
      let extraDedDetails = [];
      for (const no of data.notes_objs) {
        if (no.devengos_adicionales) {
          for (const [k, v] of Object.entries(no.devengos_adicionales)) {
            extraDev += (Number(v) || 0);
            extraDevDetails.push(`${k}: ${v}`);
          }
        }
        if (no.deducciones_adicionales) {
          for (const [k, v] of Object.entries(no.deducciones_adicionales)) {
            extraDed += (Number(v) || 0);
            extraDedDetails.push(`${k}: ${v}`);
          }
        }
      }

      const ordDev = data.salary_base + data.transport + data.overtime + data.vacaciones + data.prima + data.cesantias + data.intereses + extraDev;
      const ordDed = data.health + data.pension + data.fsp + data.rf + data.other_ded + extraDed;
      const ordNet = data.net_pay;

      const epDev = ep ? ep.total_devengos : null;
      const epDed = ep ? ep.total_deducciones : null;
      const epNet = ep ? ep.total_neto : null;
      const diffNet = ep ? Math.round((ordNet - epNet) * 100) / 100 : 'SIN_NE';
      const diffDev = ep ? Math.round((ordDev - epDev) * 100) / 100 : 'SIN_NE';
      const diffDed = ep ? Math.round((ordDed - epDed) * 100) / 100 : 'SIN_NE';

      comparisonTable.push({
        empleado: data.name,
        doc: data.doc,
        ord_dev: Math.round(ordDev * 100) / 100,
        ne_dev: epDev !== null ? Math.round(epDev * 100) / 100 : 'N/A',
        diff_dev: diffDev,
        ord_ded: Math.round(ordDed * 100) / 100,
        ne_ded: epDed !== null ? Math.round(epDed * 100) / 100 : 'N/A',
        diff_ded: diffDed,
        ord_net: Math.round(ordNet * 100) / 100,
        ne_net: epNet !== null ? Math.round(epNet * 100) / 100 : 'N/A',
        diff_net: diffNet,
        consecutivo: ep ? `${ep.prefijo}-${ep.consecutivo}` : 'N/A',
        dian_status: ep ? ep.estado_dian : 'N/A'
      });
    }

    console.table(comparisonTable);
  }
}

auditDatabase('pb_data/data.db', 8090);
auditDatabase('empresas/empresa_8091/pb_data/data.db', 8091);
