const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
const raw = rows[0].value + rows[1].value;

const tailToComplete = 'd":false,"apply_withholding_tax":false,"withholding_rate":0,"tercero_pension_id":"uc2c8p0tyz2a1cw","tercero_arl_id":"2523ik57wnazii2","tercero_caja_id":"9s6vgm8ni7tscqe","start_date":"2024-05-07","position":"AUXILIAR DE BODEGA","contract_type":"INDEFINIDO"}]';

const completeStr = raw + tailToComplete;
console.log('Complete string length:', completeStr.length);

const list = JSON.parse(completeStr);
console.log(`Successfully restored ${list.length} employee rules!`);

// Split into chunks of 5000 chars
const chunkSize = 5000;
const chunks = [];
for (let i = 0; i < completeStr.length; i += chunkSize) {
  chunks.push(completeStr.slice(i, i + chunkSize));
}

console.log(`Need ${chunks.length} parts.`);

db.prepare("DELETE FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%'").run();

chunks.forEach((chunk, idx) => {
  const key = `payroll_accounting_config_v1_employee_rules_part_${String(idx + 1).padStart(3, '0')}`;
  const id = 'r' + Math.random().toString(36).substring(2, 9);
  db.prepare("INSERT INTO settings (id, key, value) VALUES (?, ?, ?)").run(id, key, chunk);
  console.log(`Inserted ${key} with ${chunk.length} chars.`);
});

// Verify
const verifyRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let reassembled = '';
verifyRows.forEach(r => reassembled += r.value);
const parsed = JSON.parse(reassembled);
console.log(`Verification OK: parsed ${parsed.length} rules!`);
