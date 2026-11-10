const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
console.log('Tables in DB:', tables.filter(t => t.includes('payroll') || t.includes('liquid') || t.includes('finiquito') || t.includes('settle')));

// Check transactions mentioning Angelica Moncada
const txs = db.prepare("SELECT * FROM transactions WHERE contact_id = 'vsu8bz83547sxrn' OR notes LIKE '%ANGELICA%MONCADA%' OR notes LIKE '%29682675%'").all();
console.log(`\nTransactions for Angelica (${txs.length}):`);
txs.forEach(t => {
  console.log(`- ID: ${t.id}, Date: ${t.date}, Type: ${t.type}, Total: ${t.total}, Notes: ${t.notes}`);
});

// Check settings for any liquidation rules
const empRule = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullStr = '';
empRule.forEach(r => fullStr += r.value);
const rules = JSON.parse(fullStr);
const angelicaRule = rules.find(r => r.employee_id === 'vsu8bz83547sxrn');
console.log('\nAngelica rule in settings:', angelicaRule);

