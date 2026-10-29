const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const emp = db.prepare("SELECT id, name, active FROM third_parties WHERE name LIKE '%ANGELA%MARIA%GARCIA%'").get();
console.log('--- TEST: VERIFICAR LÍNEA Y CÁLCULO DE ÁNGELA MARÍA ---');
console.log('Empleado:', emp.name, 'ID:', emp.id);

const lines = db.prepare("SELECT l.*, p.name as period_name FROM payroll_lines l JOIN payroll_periods p ON l.period_id = p.id WHERE l.employee_id = ?").all(emp.id);
console.log('Total líneas:', lines.length);

for (const line of lines) {
  console.log('\n======================================================');
  console.log('Período:', line.period_name);
  console.log('Línea en DB:', {
    salary_base: line.salary_base,
    days_worked: line.days_worked,
    transport_allowance: line.transport_allowance,
    deduction_health: line.deduction_health,
    deduction_pension: line.deduction_pension,
    net_pay: line.net_pay,
    prima: line.prima,
    cesantias: line.cesantias
  });

  const meta = JSON.parse(line.notes || '{}');
  const conceptAmounts = meta?.payroll_meta?.concept_amounts || {};
  console.log('Concept amounts en DB notes:', conceptAmounts);

  // Simular getNominaConceptAmountsFromLine actualizado:
  const NOMINA_EXTRA_EARNING_KEYS = [
    'incapacidades', 'licencias', 'gastos_representacion', 'bonificacion',
    'aux_no_salariales', 'comisiones', 'dotaciones', 'compensatorios',
    'alimentacion', 'rodamiento', 'ajuste_salarial', 'vacaciones_disfrutadas',
    'prima_servicios', 'cesantias_pagadas', 'intereses_cesantias', 'otros_ingresos'
  ];
  const NOMINA_EXTRA_DEDUCTION_KEYS = ['embargo', 'cxc', 'libranza', 'prestamos'];

  function round2(v) { return Math.round(v * 100) / 100; }

  const out = {};
  [...NOMINA_EXTRA_EARNING_KEYS, ...NOMINA_EXTRA_DEDUCTION_KEYS].forEach(k => {
    out[k] = round2(Number(conceptAmounts[k] || 0));
  });

  console.log('Concept amounts tras actualización:');
  console.log('  prima_servicios:', out.prima_servicios);
  console.log('  cesantias_pagadas:', out.cesantias_pagadas);
  console.log('  comisiones:', out.comisiones);

  const days = Number(line.days_worked || 15);
  const salaryProportional = round2((Number(line.salary_base || 0) / 30) * days);
  const transport = Number(line.transport_allowance || 0);
  const overtime = Number(line.overtime || 0);
  const extraEarnings = round2(NOMINA_EXTRA_EARNING_KEYS.reduce((s, k) => s + (out[k] || 0), 0));

  const totalDevengado = round2(salaryProportional + transport + overtime + extraEarnings);
  const totalDeducciones = round2(Number(line.deduction_health || 0) + Number(line.deduction_pension || 0));
  const netoPagar = round2(totalDevengado - totalDeducciones);

  console.log('Resultados del cálculo con la corrección:');
  console.log('  Salario proporcional (15 días):', salaryProportional);
  console.log('  Aux. transporte:', transport);
  console.log('  Comisiones:', out.comisiones);
  console.log('  Total Devengado:', totalDevengado);
  console.log('  Total Deducciones:', totalDeducciones);
  console.log('  Neto a pagar calculado:', netoPagar);
  console.log('  Neto a pagar guardado en DB:', line.net_pay);

  if (line.period_name.includes('Octubre 2026')) {
    const ok = totalDevengado === 1071798.26 && netoPagar === 996018.2 && out.prima_servicios === 0 && out.cesantias_pagadas === 0;
    console.log('\n>>> ¿TEST DE OCTUBRE PASÓ EXITOSAMENTE?:', ok ? 'SI ✓ (100% Correcto)' : 'NO ✗');
  }
}
