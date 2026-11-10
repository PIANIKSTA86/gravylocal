const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE '%employee_rules%' OR key LIKE '%nomina%'").all();
rows.forEach(r => {
  console.log('KEY:', r.key);
  try {
    const parsed = JSON.parse(r.value);
    if (Array.isArray(parsed)) {
      console.log(`Found array with ${parsed.length} items:`);
      parsed.forEach(item => {
        console.log(`- emp_id: ${item.employee_id}, start_date: ${item.start_date}, end_date: ${item.end_date}, contract_type: ${item.contract_type}, salary: ${item.basic_salary}`);
      });
    } else {
      console.log('Object keys:', Object.keys(parsed));
    }
  } catch (e) {
    console.log('Raw value (first 200 chars):', r.value.slice(0, 200));
  }
});

