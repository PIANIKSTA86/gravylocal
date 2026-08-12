const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const empresas = fs.readdirSync('empresas').filter(d => {
  try { return fs.statSync('empresas/' + d).isDirectory(); } catch(e) { return false; }
});
console.log('Empresas:', empresas.join(', '));

function queryDB(dbPath, sql) {
  return new Promise((res, rej) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
      if (err) return rej(err);
      db.all(sql, [], (e, rows) => {
        db.close();
        if (e) rej(e); else res(rows);
      });
    });
  });
}

async function run() {
  for (const emp of empresas) {
    const dbPath = path.resolve('empresas', emp, 'pb_data', 'data.db');
    if (!fs.existsSync(dbPath)) continue;
    try {
      const lines = await queryDB(dbPath, 'SELECT * FROM payroll_lines LIMIT 2');
      if (!lines.length) { console.log('\n' + emp + ': no payroll_lines'); continue; }
      const l = lines[0];
      console.log('\n=== ' + emp + ' ===');
      console.log('salary_base:', l.salary_base, '| days_worked:', l.days_worked, '| emp:', l.employee_id);
      console.log('transport_allowance:', l.transport_allowance, '| overtime:', l.overtime);
      console.log('deduction_health:', l.deduction_health, '| deduction_pension:', l.deduction_pension);
      console.log('solidarity_fund:', l.solidarity_fund, '| withholding_tax:', l.withholding_tax);
      console.log('notes/meta (500):', (l.notes || 'NULL').slice(0, 500));

      const eps = await queryDB(dbPath, 'SELECT * FROM electronic_payrolls LIMIT 1');
      if (eps.length) {
        console.log('\nXML sample (first 600 chars):');
        console.log((eps[0].xml_generado || 'EMPTY').slice(0, 600));
        console.log('employee_id in ep:', eps[0].employee_id, '| ano:', eps[0].ano, '| mes:', eps[0].mes);
      }

      const compSets = await queryDB(dbPath, "SELECT key, value FROM settings WHERE key = 'company'");
      if (compSets.length) console.log('\ncompany setting:', compSets[0].value.slice(0, 300));

      // Check third_parties for employees
      const emps = await queryDB(dbPath, "SELECT id, name, doc_number, doc_type, email, notes, bank_name, bank_account, first_name, last_name, city, department FROM third_parties WHERE type='EMPLEADO' LIMIT 3");
      emps.forEach(e => {
        console.log('\n[employee]', e.name, '|', e.doc_type, e.doc_number, '| email:', e.email);
        console.log('  bank:', e.bank_name, '| account:', e.bank_account);
        console.log('  first_name:', e.first_name, '| last_name:', e.last_name);
        console.log('  city:', e.city, '| dept:', e.department);
      });
    } catch(e) { console.log(emp + ' error:', e.message); }
  }
}

run().catch(console.error);
