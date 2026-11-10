const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');

// Load resolutions
const resolutions = db.prepare("SELECT * FROM dian_resolutions WHERE active = 1").all();

// Mock $app
global.$app = {
  findFirstRecordByFilter: function(col, filter) {
    if (col === 'dian_resolutions') {
      const typeMatch = filter.match(/document_type\s*=\s*'([^']+)'/);
      const docType = typeMatch ? typeMatch[1] : 'NE';
      const row = resolutions.find(r => r.document_type === docType);
      if (row) {
        return {
          getString: (f) => String(row[f] || ''),
          getInt: (f) => Number(row[f] || 0)
        };
      }
    }
    return null;
  }
};

// Load builder
const builderCode = fs.readFileSync(path.join(__dirname, '../pb_hooks/dian_nomina_matias_builder.js'), 'utf8');
eval(builderCode);

// Query electronic payrolls for September 2026
const epRows = db.prepare(`
  SELECT ep.*, tp.name as emp_name, tp.doc_number as emp_doc, tp.email as emp_email,
         tp.address as emp_addr, tp.phone as emp_phone
  FROM electronic_payrolls ep
  LEFT JOIN third_parties tp ON ep.employee_id = tp.id
  WHERE ep.mes = 9 AND ep.ano = 2026
  ORDER BY ep.consecutivo ASC
`).all();

console.log(`\n========================================================================================`);
console.log(`INSPECCIÓN DE NÓMINA ELECTRÓNICA — PERIODO SEPTIEMBRE 2026 (${epRows.length} VOLANTES EN TOTAL)`);
console.log(`========================================================================================\n`);

const summary = [];

epRows.forEach((sample, idx) => {
  const mockRec = {
    getString: (k) => String(sample[k] || ''),
    getFloat: (k) => Number(sample[k] || 0),
    getInt: (k) => Number(sample[k] || 0),
    set: (k, v) => { sample[k] = v; }
  };

  const result = buildMatiasPayrollPayloadFromRec(mockRec, false, sample.prefijo, sample.consecutivo);
  const p = result.payload;

  const dev = parseFloat(p.total_earned);
  const ded = parseFloat(p.deductions_total);
  const net = parseFloat(p.total_voucher);
  const calcDiff = Math.abs((dev - ded) - net);
  const mathOk = calcDiff < 0.05 ? 'CORRECTO' : `DISCREPANCIA (${calcDiff})`;

  summary.push({
    No: idx + 1,
    Consecutivo: `${p.prefix}-${p.document_number}`,
    Empleado: `${p.employee.first_name} ${p.employee.first_surname} ${p.employee.second_surname}`.trim(),
    Cedula: p.employee.document_number,
    Sueldo: `$${Number(p.employee.salary).toLocaleString('es-CO')}`,
    Devengos: `$${Number(p.total_earned).toLocaleString('es-CO')}`,
    Deducciones: `$${Number(p.deductions_total).toLocaleString('es-CO')}`,
    Neto: `$${Number(p.total_voucher).toLocaleString('es-CO')}`,
    Cuadre: mathOk
  });
});

console.table(summary);

// Display detailed JSON for sample 0 (AMPARO REYES SARRIA) and sample 7 (CATALINA MARTINEZ REYES)
[0, 7].forEach(sampleIdx => {
  const sample = epRows[sampleIdx];
  const mockRec = {
    getString: (k) => String(sample[k] || ''),
    getFloat: (k) => Number(sample[k] || 0),
    getInt: (k) => Number(sample[k] || 0),
    set: (k, v) => { sample[k] = v; }
  };
  const res = buildMatiasPayrollPayloadFromRec(mockRec, false, sample.prefijo, sample.consecutivo);
  console.log(`\n========================================================================================`);
  console.log(`JSON COMPLETO QUE SE TRANSMITIRÍA A MATIAS API PARA: ${sample.emp_name} (${sample.prefijo}-${sample.consecutivo})`);
  console.log(`Endpoint destino: ${res.endpoint}`);
  console.log(`========================================================================================`);
  console.log(JSON.stringify(res.payload, null, 2));
});

