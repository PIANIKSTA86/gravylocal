const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const resolutions = db.prepare("SELECT * FROM dian_resolutions WHERE active = 1").all();

global.$app = {
  findFirstRecordByFilter: function(col, filter) {
    if (col === 'dian_resolutions') {
      const typeMatch = filter.match(/document_type\s*=\s*'([^']+)'/);
      const docType = typeMatch ? typeMatch[1] : 'NE';
      const row = resolutions.find(r => r.document_type === docType);
      if (row) return { getString: (f) => String(row[f] || ''), getInt: (f) => Number(row[f] || 0) };
    }
    return null;
  },
  findRecordsByFilter: function(col, filter) {
    if (col === 'settings') {
      const rows = db.prepare("SELECT * FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%'").all();
      return rows.map(r => ({
        getString: (f) => String(r[f] || '')
      }));
    }
    return [];
  }
};

const builderCode = fs.readFileSync(path.join(__dirname, '../pb_hooks/dian_nomina_matias_builder.js'), 'utf8');
eval(builderCode);

const epRows = db.prepare(`
  SELECT ep.*, tp.name as emp_name, tp.doc_number as emp_doc
  FROM electronic_payrolls ep
  LEFT JOIN third_parties tp ON ep.employee_id = tp.id
  WHERE ep.mes = 9 AND ep.ano = 2026
  ORDER BY ep.consecutivo ASC
`).all();

const list = [];
epRows.forEach(row => {
  const mockRec = {
    getString: (k) => String(row[k] || ''),
    getFloat: (k) => Number(row[k] || 0),
    getInt: (k) => Number(row[k] || 0),
    set: (k, v) => { row[k] = v; }
  };
  const res = buildMatiasPayrollPayloadFromRec(mockRec, false, row.prefijo, row.consecutivo);
  list.push({
    Consecutivo: `${row.prefijo}-${row.consecutivo}`,
    Empleado: row.emp_name,
    Documento: row.emp_doc,
    Fecha_Ingreso_MATIAS: res.payload.period.date_entry,
    Periodo_Liquidacion: `${res.payload.period.settlement_start_date} al ${res.payload.period.settlement_end_date}`
  });
});

console.table(list);

