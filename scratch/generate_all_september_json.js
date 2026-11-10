const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Mock PocketBase $app context for Goja runtime
global.$app = {
  findFirstRecordByFilter: (col, filter) => {
    if (col === 'dian_resolutions') {
      const isNane = filter.includes('NANE');
      const docType = isNane ? 'NANE' : 'NE';
      const row = db.prepare("SELECT * FROM dian_resolutions WHERE document_type = ? AND active = 1").get(docType);
      if (!row) return null;
      return {
        getString: (k) => String(row[k] || ''),
        getInt: (k) => Number(row[k] || 0)
      };
    }
    if (col === 'settings') {
      const m = filter.match(/key\s*=\s*'([^']+)'/);
      if (m) {
        const row = db.prepare("SELECT * FROM settings WHERE key = ?").get(m[1]);
        if (!row) return null;
        return {
          get: (k) => row[k],
          getString: (k) => String(row[k] || '')
        };
      }
    }
    return null;
  },
  findRecordsByFilter: (col, filter) => {
    if (col === 'settings' && filter.includes('payroll_accounting_config_v1_employee_rules')) {
      const rows = db.prepare("SELECT * FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
      return rows.map(r => ({
        getString: (k) => String(r[k] || '')
      }));
    }
    return [];
  }
};

const builder = require('../pb_hooks/dian_nomina_matias_builder.js');

const records = db.prepare("SELECT * FROM electronic_payrolls WHERE ano = 2026 AND mes = 9 ORDER BY consecutivo ASC").all();
console.log(`Encontrados ${records.length} registros de nómina electrónica para Septiembre 2026:\n`);

const results = [];

records.forEach(rec => {
  const fakeRec = {
    getString: (k) => String(rec[k] || ''),
    getInt: (k) => Number(rec[k] || 0),
    getFloat: (k) => Number(rec[k] || 0),
    set: (k, v) => {}
  };

  const isAjuste = (rec.prefijo && (rec.prefijo.startsWith('NA') || rec.prefijo.startsWith('AJ') || rec.prefijo === 'NANE')) || (rec.xml_generado && rec.xml_generado.includes('NominaIndividualDeAjuste'));
  const res = builder.buildMatiasPayrollPayloadFromRec(fakeRec, isAjuste, rec.prefijo || 'NOM', rec.consecutivo);
  
  const tp = db.prepare("SELECT name, doc_number FROM third_parties WHERE id = ?").get(rec.employee_id);

  results.push({
    consecutivo: `${rec.prefijo || 'NOM'}-${rec.consecutivo}`,
    empleado: tp ? tp.name : 'Desconocido',
    documento: tp ? tp.doc_number : '00000000',
    endpoint: res.endpoint,
    payload: res.payload
  });
});

console.log(JSON.stringify(results.map(r => ({
  consecutivo: r.consecutivo,
  empleado: r.empleado,
  documento: r.documento,
  endpoint: r.endpoint,
  date_entry: r.payload.period?.date_entry,
  salary: r.payload.worker?.salary,
  worked_days: r.payload.earn?.basic?.worked_days || r.payload.accrued?.basic?.worked_days,
  salary_worked: r.payload.earn?.basic?.salary_worked || r.payload.accrued?.basic?.salary_worked,
  accrued_total: r.payload.accrued_total,
  deductions_total: r.payload.deductions_total,
  payroll_total: r.payload.payroll_total
})), null, 2));

// Save full payloads to file
const fs = require('fs');
fs.writeFileSync('scratch/september_matias_payloads.json', JSON.stringify(results, null, 2));
console.log('\nPayloads completos guardados en scratch/september_matias_payloads.json');

