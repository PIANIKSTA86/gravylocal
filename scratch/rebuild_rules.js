const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Let's get the 22 employees from third_parties
const employees = db.prepare("SELECT id, name, doc_number FROM third_parties WHERE is_employee = 1 OR employee_code IS NOT NULL").all();
console.log('Found employees in third_parties:', employees.length);

// Let's read step_2978_output.txt which has the exact mapping
const fs = require('fs');
const lines = fs.readFileSync('scratch/step_2978_output.txt', 'utf8').split('\n');
const ruleInfo = [];
lines.forEach(l => {
  const m = l.match(/ID: (\w+)\s*\|\s*([^\|]+)\s*\|\s*Start:\s*'([^']*)'/);
  if (m) {
    ruleInfo.push({ id: m[1], name: m[2].trim(), start: m[3] === 'undefined' ? null : m[3] });
  }
});
console.log('Found ruleInfo from step 2978:', ruleInfo.length);
console.log(ruleInfo);

