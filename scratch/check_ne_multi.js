const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Try all empresa folders
const fs = require('fs');
const empresas = fs.readdirSync('empresas').filter(d => fs.statSync('empresas/' + d).isDirectory());
console.log('Empresas:', empresas.join(', '));

for (const emp of empresas) {
  const dbPath = path.resolve('empresas', emp, 'pb_data', 'data.db');
  if (!fs.existsSync(dbPath)) continue;
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  const query = (sql) => new Promise((res, rej) => db.all(sql, [], (e, r) => e ? rej(e) : res(r)));
  try {
    const lines = await query('SELECT * FROM payroll_lines LIMIT 1');
    if (lines.length) {
      const l = lines[0];
      console.log('\n=== ' + emp + ' payroll_line ===');
      console.log('notes/meta:', (l.notes || '').slice(0, 400));
      console.log('salary:', l.salary_base, 'days:', l.days_worked, 'emp_id:', l.employee_id);
      const eps = await query('SELECT * FROM electronic_payrolls LIMIT 1');
      if (eps.length) console.log('xml sample:', (eps[0].xml_generado || '').slice(0, 400));
      const settings = await query("SELECT key, value FROM settings WHERE key = 'company'");
      if (settings.length) console.log('company setting:', (settings[0].value || '').slice(0, 300));
    }
  } catch(e) { console.log(emp + ' error:', e.message); }
  db.close();
}
