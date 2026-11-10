const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rules = JSON.parse(fs.readFileSync('scratch/all_22_rules_original.json', 'utf8'));

const REAL_HIRE_DATES = {
  'gyilekodzdj1sde': { start_date: '2025-06-01', position: 'ASISTENTE ADMINISTRATIVA', contract_type: 'INDEFINIDO' },
  'cz5t165sse24oa2': { start_date: '2025-03-10', position: 'AUXILIAR DE VENTAS', contract_type: 'INDEFINIDO' },
  'vsu8bz83547sxrn': { start_date: '2024-02-15', position: 'OPERARIA / BODEGA', contract_type: 'INDEFINIDO' },
  'b6c3mvlw6b9rodf': { start_date: '2025-01-13', position: 'ASESOR COMERCIAL', contract_type: 'INDEFINIDO' },
  'v21xfu4abpcba2f': { start_date: '2025-03-06', position: 'ASESOR COMERCIAL', contract_type: 'INDEFINIDO' },
  'j8jctmcchsrgm5b': { start_date: '2026-07-01', position: 'AUXILIAR CONTABLE', contract_type: 'INDEFINIDO' },
  'waykc023e9kpeen': { start_date: '2024-05-07', position: 'AUXILIAR DE BODEGA', contract_type: 'INDEFINIDO' },
  'cm6g6vpckf15ct8': { start_date: '2023-06-15', position: 'ANALISTA DE LOGISTICA', contract_type: 'INDEFINIDO' },
  'quzokljc9p33j75': { start_date: '2026-09-09', position: 'SERVICIOS GENERALES', contract_type: 'INDEFINIDO' },
  '0zbb63nz7p6tzwc': { start_date: '2026-07-01', position: 'TESORERA', contract_type: 'INDEFINIDO' },
  'jqq5tlo1sze2ulu': { start_date: '2026-05-01', position: 'ASESOR COMERCIAL', contract_type: 'INDEFINIDO' }
};

rules.forEach(r => {
  const m = REAL_HIRE_DATES[r.employee_id];
  if (m) {
    r.start_date = m.start_date;
    if (!r.position) r.position = m.position;
    if (!r.contract_type) r.contract_type = m.contract_type;
  }
});

const fullStr = JSON.stringify(rules);
console.log('Total JSON length to save:', fullStr.length);

const chunkSize = 5000;
const chunks = [];
for (let i = 0; i < fullStr.length; i += chunkSize) {
  chunks.push(fullStr.slice(i, i + chunkSize));
}
console.log(`Saving ${chunks.length} parts into settings...`);

db.prepare("DELETE FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%'").run();

chunks.forEach((chunk, idx) => {
  const key = `payroll_accounting_config_v1_employee_rules_part_${String(idx + 1).padStart(3, '0')}`;
  const id = 'r' + Math.random().toString(36).substring(2, 9);
  db.prepare("INSERT INTO settings (id, key, value) VALUES (?, ?, ?)").run(id, key, chunk);
  console.log(`Inserted ${key} (${chunk.length} chars)`);
});

// Verification check
const verifyRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let reassembled = '';
verifyRows.forEach(r => reassembled += r.value);
const parsed = JSON.parse(reassembled);
console.log(`Verification OK: successfully parsed ${parsed.length} rules!`);

