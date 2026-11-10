const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

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

// 1. Update settings payroll_accounting_config_v1_employee_rules
const rows = db.prepare("SELECT id, key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullStr = '';
rows.forEach(r => { fullStr += r.value; });
const employeeRules = JSON.parse(fullStr);

console.log('Updating employee_rules in settings...');
employeeRules.forEach(rule => {
  const match = REAL_HIRE_DATES[rule.employee_id];
  if (match) {
    rule.start_date = match.start_date;
    if (!rule.position) rule.position = match.position;
    if (!rule.contract_type) rule.contract_type = match.contract_type;
    console.log(`- Updated rule for ${rule.employee_id}: start_date=${rule.start_date}, pos=${rule.position}`);
  }
});

// Re-chunk and save back to settings
const updatedFullStr = JSON.stringify(employeeRules);
const chunkSize = 5000;
const chunks = [];
for (let i = 0; i < updatedFullStr.length; i += chunkSize) {
  chunks.push(updatedFullStr.slice(i, i + chunkSize));
}

for (let i = 0; i < chunks.length; i++) {
  const rowId = rows[i]?.id;
  if (rowId) {
    db.prepare("UPDATE settings SET value = ? WHERE id = ?").run(chunks[i], rowId);
    console.log(`Saved settings part ${i + 1} (${chunks[i].length} chars)`);
  }
}

// 2. Update September 2026 electronic_payrolls xml_generado with real FechaIngreso
console.log('\nUpdating September 2026 electronic_payrolls XMLs...');
const epSep = db.prepare("SELECT id, employee_id, consecutivo, xml_generado FROM electronic_payrolls WHERE mes = 9 AND ano = 2026").all();

epSep.forEach(ep => {
  const match = REAL_HIRE_DATES[ep.employee_id];
  if (match && ep.xml_generado) {
    const updatedXml = ep.xml_generado.replace(/FechaIngreso="[^"]*"/i, `FechaIngreso="${match.start_date}"`);
    db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(updatedXml, ep.id);
    console.log(`- Updated NOM-${ep.consecutivo} (${ep.employee_id}) -> FechaIngreso="${match.start_date}"`);
  }
});

console.log('\nUpdate completed successfully!');

