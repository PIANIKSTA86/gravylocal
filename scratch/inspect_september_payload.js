const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');

// Load resolutions
const resolutions = db.prepare("SELECT * FROM dian_resolutions WHERE active = 1").all();
console.log('Active resolutions found in DB:', resolutions.map(r => `${r.document_type}: ${r.prefix}-${r.resolution_number}`));

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
  SELECT ep.*, tp.name as emp_name, tp.doc_number as emp_doc, tp.email as emp_email
  FROM electronic_payrolls ep
  LEFT JOIN third_parties tp ON ep.employee_id = tp.id
  WHERE ep.mes = 9 AND ep.ano = 2026
  ORDER BY ep.consecutivo ASC
`).all();

console.log(`Found ${epRows.length} electronic payroll records for September 2026.`);

// Test one record in detail:
const sample = epRows[0]; // AMPARO REYES SARRIA NOM-364
console.log(`\n======================================================`);
console.log(`DETALLE DE PRUEBA: ${sample.emp_name} (${sample.prefijo}-${sample.consecutivo})`);
console.log(`Documento: ${sample.emp_doc} | Devengos: ${sample.total_devengos} | Deducciones: ${sample.total_deducciones} | Neto: ${sample.total_neto}`);
console.log(`======================================================\n`);

const mockRec = {
  getString: (k) => String(sample[k] || ''),
  getFloat: (k) => Number(sample[k] || 0),
  getInt: (k) => Number(sample[k] || 0),
  set: (k, v) => { sample[k] = v; }
};

const result = buildMatiasPayrollPayloadFromRec(mockRec, false, sample.prefijo, sample.consecutivo);

console.log('--- ENDPOINT DESTINO MATIAS API ---');
console.log(result.endpoint);

console.log('\n--- PAYLOAD JSON QUE SE ENVIARÍA A MATIAS API ---');
console.log(JSON.stringify(result.payload, null, 2));

console.log('\n--- XML ORIGEN EN LA BASE DE DATOS (Extracto) ---');
console.log(sample.xml_generado ? sample.xml_generado.slice(0, 1000) + '...' : '(Sin XML)');

