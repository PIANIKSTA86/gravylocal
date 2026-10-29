const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

// 1. Update Alison's contract in settings
const rows = db.prepare("SELECT id, key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%' ORDER BY key").all();
const fullStr = rows.map(r => r.value).join('');
const list = JSON.parse(fullStr);

const alisonRule = list.find(e => e.employee_id === '0zbb63nz7p6tzwc');
if (alisonRule) {
  console.log('Old Alison rule:', alisonRule);
  alisonRule.end_date = '2026-03-26';
  console.log('New Alison rule:', alisonRule);
}

// Split back into chunks of <= 5000 chars as PocketBase settings chunker does
const updatedFullStr = JSON.stringify(list);
const chunkSize = 5000;
const chunks = [];
for (let i = 0; i < updatedFullStr.length; i += chunkSize) {
  chunks.push(updatedFullStr.slice(i, i + chunkSize));
}

for (let i = 0; i < chunks.length; i++) {
  const rowId = rows[i]?.id;
  if (rowId) {
    db.prepare("UPDATE settings SET value = ? WHERE id = ?").run(chunks[i], rowId);
    console.log(`Updated settings part ${i + 1} (row ${rowId})`);
  }
}

// 2. Recalculate Alison's line in Q2
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const daysWorked = 11;
const basicSalary = 2174000;
const salaryProportional = round2((basicSalary / 30) * daysWorked); // 797133.33
const transportMonthly = 249095;
const transportAllowance = round2((transportMonthly / 30) * daysWorked); // 91334.83
const totalEarnings = round2(salaryProportional + transportAllowance); // 888468.16

const deductionHealth = round2(salaryProportional * 0.04); // 31885.33
const deductionPension = round2(salaryProportional * 0.04); // 31885.33
const totalDeductions = round2(deductionHealth + deductionPension); // 63770.66
const netPay = round2(totalEarnings - totalDeductions); // 824697.50

const employerPension = round2(salaryProportional * 0.12); // 95656.00
const employerArl = round2(salaryProportional * 0.00522); // 4161.04
const cajaComp = round2(salaryProportional * 0.04); // 31885.33

const cesantias = round2((totalEarnings * 0.0833)); // 74009.40
const interesesCes = round2((cesantias * 0.12)); // 8881.13
const prima = round2((totalEarnings * 0.0833)); // 74009.40
const vacaciones = round2((salaryProportional * 0.0417)); // 33240.46

const line = db.prepare("SELECT * FROM payroll_lines WHERE period_id = 'gppva4wnpposmj2' AND employee_id = '0zbb63nz7p6tzwc'").get();
if (line) {
  let meta = {};
  try {
    const parsed = JSON.parse(line.notes);
    meta = parsed.payroll_meta || {};
  } catch (_) {}

  meta.ibc = salaryProportional;
  meta.ibc_ss = salaryProportional;
  meta.ibc_pension = salaryProportional;
  meta.ibc_cajas = salaryProportional;
  meta.transport_days = daysWorked;
  meta.retiro_date = '2026-03-26';

  const newNotes = JSON.stringify({ payroll_meta: meta });

  db.prepare(`
    UPDATE payroll_lines 
    SET days_worked = ?,
        salary_base = ?,
        transport_allowance = ?,
        deduction_health = ?,
        deduction_pension = ?,
        employer_pension = ?,
        employer_arl = ?,
        caja_comp = ?,
        cesantias = ?,
        intereses_ces = ?,
        prima = ?,
        vacaciones = ?,
        net_pay = ?,
        notes = ?
    WHERE id = ?
  `).run(
    daysWorked,
    basicSalary,
    transportAllowance,
    deductionHealth,
    deductionPension,
    employerPension,
    employerArl,
    cajaComp,
    cesantias,
    interesesCes,
    prima,
    vacaciones,
    netPay,
    newNotes,
    line.id
  );

  console.log('Successfully updated payroll_lines for Alison in Q2:');
  const updatedLine = db.prepare("SELECT * FROM payroll_lines WHERE id = ?").get(line.id);
  console.log(updatedLine);
}
