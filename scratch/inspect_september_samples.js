const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

function round2(v) {
  return Math.round((Number(v) || 0) * 100) / 100;
}

// 1. Read company settings
const compSetting = db.prepare("SELECT value FROM settings WHERE key = 'company'").get();
const compObj = compSetting ? JSON.parse(compSetting.value) : {};

// 2. Read employee rules from settings
const ruleRows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullRulesStr = '';
ruleRows.forEach(r => { fullRulesStr += r.value; });
const employeeRules = JSON.parse(fullRulesStr);
const rulesMap = new Map();
employeeRules.forEach(r => rulesMap.set(r.employee_id, r));

// 3. Read September period
const period = db.prepare("SELECT * FROM payroll_periods WHERE date_from LIKE '2026-09%'").get();

// 4. Read electronic payroll records for September
const epRecords = db.prepare("SELECT * FROM electronic_payrolls WHERE ano = 2026 AND mes = 9 ORDER BY consecutivo ASC").all();

console.log(`Periodo Septiembre 2026: ID ${period ? period.id : 'N/A'}`);
console.log(`Total registros en electronic_payrolls: ${epRecords.length}\n`);

// Let's inspect the first record (NOM-364) and seventh record (NOM-371)
const samples = [epRecords[0], epRecords[7]];

samples.forEach(ep => {
  const tp = db.prepare("SELECT * FROM third_parties WHERE id = ?").get(ep.employee_id);
  const rule = rulesMap.get(ep.employee_id);

  console.log(`================================================================`);
  console.log(`COMPROBANTE NOM-${ep.consecutivo} — ${tp ? tp.name : 'Desconocido'}`);
  console.log(`================================================================`);

  // Let's check what is in ep.xml_generado
  const raw = (ep.xml_generado || '').trim();
  console.log(`Formato actual almacenado en BD: ${raw.startsWith('{') ? 'JSON Nativo' : 'XML UBL 2.1'}`);

  // Let's construct the native MATIAS payload according to our new buildMatiasPayrollPayload
  const rawName = tp ? tp.name.trim() : 'EMPLEADO';
  const nameParts = rawName.split(/\s+/).filter(Boolean);
  let primerNombre = nameParts[0] || 'EMPLEADO';
  let otrosNombres = nameParts.length > 3 ? nameParts[1] : '';
  let primerApellido = nameParts.length >= 3 ? (nameParts.length > 3 ? nameParts[2] : nameParts[1]) : (nameParts[1] || 'APELLIDO');
  let segundoApellido = nameParts.length >= 3 ? nameParts.slice(nameParts.length > 3 ? 3 : 2).join(' ') : '';

  const dateEntry = rule ? rule.start_date : (tp.date_hired || '2024-01-01');

  console.log(`- Documento: ${tp.doc_number}`);
  console.log(`- Cargo: ${rule?.position || tp.notes || 'Colaborador'}`);
  console.log(`- Fecha de ingreso real (Contrato): ${dateEntry}`);
  console.log(`- Banco: ${tp.bank_name || 'Bancolombia'} | Cuenta: ${tp.bank_account || 'N/A'} (${tp.bank_account_type || 'Ahorros'})`);
  console.log(`- Devengos Totales: $${ep.total_devengos.toLocaleString('es-CO')}`);
  console.log(`- Deducciones Totales: $${ep.total_deducciones.toLocaleString('es-CO')}`);
  console.log(`- Neto a Pagar: $${ep.total_neto.toLocaleString('es-CO')}`);
  console.log(`- Cuadre matemático: $${round2(ep.total_devengos - ep.total_deducciones)} === $${round2(ep.total_neto)} (${round2(ep.total_devengos - ep.total_deducciones) === round2(ep.total_neto) ? 'PERFECTO' : 'DESCUADRADO'})`);
});
