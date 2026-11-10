const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Global mock for PocketBase $app context
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

// Inspect NOM-371
const rec = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 371").get();
const fakeRec = {
  getString: (k) => String(rec[k] || ''),
  getInt: (k) => Number(rec[k] || 0),
  getFloat: (k) => Number(rec[k] || 0),
  set: (k, v) => {}
};

const res = builder.buildMatiasPayrollPayloadFromRec(fakeRec, false, rec.prefijo || 'NOM', rec.consecutivo);

console.log(JSON.stringify({
  target_endpoint: res.endpoint,
  payload_json_to_send: res.payload
}, null, 2));

