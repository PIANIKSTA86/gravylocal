const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`SELECT * FROM payroll_lines`, (err, lines) => {
  if (err) return console.error(err);
  console.log(`Total lines: ${lines.length}`);
  lines.forEach(l => {
    let conceptAmounts = {};
    let extraEarnings = 0;
    let extraDeductions = 0;
    let solidarity = Number(l.solidarity_fund || 0);
    let withholding = Number(l.withholding_tax || 0);
    if (l.notes) {
      try {
        const parsed = JSON.parse(l.notes);
        conceptAmounts = parsed?.payroll_meta?.concept_amounts || {};
        if (parsed?.payroll_meta?.solidarity_fund) solidarity = Number(parsed.payroll_meta.solidarity_fund);
        if (parsed?.payroll_meta?.withholding_tax) withholding = Number(parsed.payroll_meta.withholding_tax);
      } catch (_) {}
    }
    const extraEarningKeys = [
      'incapacidades', 'licencias', 'gastos_representacion', 'bonificacion',
      'aux_no_salariales', 'comisiones', 'dotaciones', 'compensatorios',
      'alimentacion', 'rodamiento', 'ajuste_salarial', 'vacaciones_disfrutadas', 'otros_ingresos'
    ];
    const extraDedKeys = ['embargo', 'cxc', 'libranza', 'prestamos'];
    extraEarningKeys.forEach(k => { extraEarnings += Number(conceptAmounts[k] || 0); });
    extraDedKeys.forEach(k => { extraDeductions += Number(conceptAmounts[k] || 0); });

    const salProp = ((Number(l.salary_base) || 0) / 30) * (Number(l.days_worked) || 30);
    const ot = Number(l.overtime || 0);
    const aux = Number(l.transport_allowance || 0);
    const totDev = Math.round((salProp + ot + aux + extraEarnings) * 100) / 100;

    const dedHealth = Number(l.deduction_health || 0);
    const dedPension = Number(l.deduction_pension || 0);
    const dedOther = Number(l.deduction_other || 0);
    const totDed = Math.round((dedHealth + dedPension + dedOther + solidarity + withholding + extraDeductions) * 100) / 100;

    const correctNet = Math.round((totDev - totDed) * 100) / 100;
    const diff = Math.round((Number(l.net_pay || 0) - correctNet) * 100) / 100;

    if (Math.abs(diff) > 0.01) {
      console.log(`Line ID: ${l.id} | Stored net_pay: ${l.net_pay} | Correct net: ${correctNet} | Diff: ${diff}`);
    }
  });
  db.close();
});
