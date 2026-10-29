const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const employees = db.prepare(`
  SELECT id, name, doc_number, notes 
  FROM third_parties 
  WHERE notes LIKE '%contract%' OR notes LIKE '%salary%' OR notes LIKE '%hire_date%'
`).all();

console.log('Employees found:', employees.length);
employees.forEach(e => {
  console.log(`\nEmployee: ${e.name} (${e.doc_number})`);
  try {
    const parsed = JSON.parse(e.notes);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (_) {
    console.log(e.notes);
  }
});
