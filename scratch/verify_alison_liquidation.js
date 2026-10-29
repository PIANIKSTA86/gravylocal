const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const line = db.prepare("SELECT * FROM payroll_lines WHERE period_id = 'gppva4wnpposmj2' AND employee_id = '0zbb63nz7p6tzwc'").get();
console.log('Alison Line in Q2 (Marzo 2026):');
console.log('Days worked:', line.days_worked);
console.log('Salary Base:', line.salary_base);
console.log('Salary Proportional (11 days):', ((line.salary_base / 30) * line.days_worked));
console.log('Transport Allowance:', line.transport_allowance);
console.log('Total Devengado:', ((line.salary_base / 30) * line.days_worked) + line.transport_allowance);
console.log('Health Deduction (4%):', line.deduction_health);
console.log('Pension Deduction (4%):', line.deduction_pension);
console.log('Net Pay:', line.net_pay);
console.log('Notes metadata:', JSON.parse(line.notes));

// Check contract end date
const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%' ORDER BY key").all();
const fullStr = rows.map(r => r.value).join('');
const list = JSON.parse(fullStr);
const alisonRule = list.find(e => e.employee_id === '0zbb63nz7p6tzwc');
console.log('Alison contract in settings:');
console.log('Start date:', alisonRule?.start_date);
console.log('End date:', alisonRule?.end_date);
