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
  }
};

const builderCode = fs.readFileSync(path.join(__dirname, '../pb_hooks/dian_nomina_matias_builder.js'), 'utf8');
eval(builderCode);

const sampleCielo = db.prepare("SELECT * FROM electronic_payrolls WHERE mes = 9 AND ano = 2026 AND consecutivo = 368").get();
const mockRec = {
  getString: (k) => String(sampleCielo[k] || ''),
  getFloat: (k) => Number(sampleCielo[k] || 0),
  getInt: (k) => Number(sampleCielo[k] || 0),
  set: (k, v) => { sampleCielo[k] = v; }
};
const resCielo = buildMatiasPayrollPayloadFromRec(mockRec, false, sampleCielo.prefijo, sampleCielo.consecutivo);
console.log('CIELO ALDANA JSON:');
console.log(JSON.stringify(resCielo.payload, null, 2));

