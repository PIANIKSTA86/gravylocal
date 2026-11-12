const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cieloId = 'v21xfu4abpcba2f';
const ano = 2026;
const mes = 9;

// Query lines for Sept
const lines = db.prepare(`SELECT * FROM payroll_lines WHERE employee_id = ? AND period_id IN ('ee1fqygbh9nkr14', 'f3s749sgiclejbz')`).all(cieloId);

function round2(v) { return Math.round(Number(v || 0) * 100) / 100; }

let accumEmp = {
  sueldoBasico: 0,
  totalDevengos: 0,
  totalDeducciones: 0,
  netoPagar: 0,
  diasLaborados: 0,
  auxilioTransporte: 0,
  comisionesMonto: 0,
  rodamientoMonto: 0,
  auxNoSalarialesMonto: 0,
  dotacionMonto: 0,
  alimentacionMonto: 0,
  saludDeduccion: 0,
  pensionDeduccion: 0
};

lines.forEach(l => {
  const meta = JSON.parse(l.notes);
  const ca = meta.payroll_meta.concept_amounts;
  accumEmp.sueldoBasico += round2((l.salary_base / 30) * l.days_worked);
  accumEmp.auxilioTransporte += l.transport_allowance;
  accumEmp.comisionesMonto += round2(ca.comisiones || 0);
  accumEmp.rodamientoMonto += round2(ca.rodamiento || 0);
  accumEmp.saludDeduccion += l.deduction_health;
  accumEmp.pensionDeduccion += l.deduction_pension;
  accumEmp.diasLaborados += l.days_worked;
});

accumEmp.totalDevengos = round2(accumEmp.sueldoBasico + accumEmp.auxilioTransporte + accumEmp.comisionesMonto + accumEmp.rodamientoMonto);
accumEmp.totalDeducciones = round2(accumEmp.saludDeduccion + accumEmp.pensionDeduccion);
accumEmp.netoPagar = round2(accumEmp.totalDevengos - accumEmp.totalDeducciones);

console.log('Accumulated for Cielo:', accumEmp);

const totalAux = round2((accumEmp.rodamientoMonto || 0) + (accumEmp.dotacionMonto || 0) + (accumEmp.auxNoSalarialesMonto || 0) + (accumEmp.alimentacionMonto || 0));
console.log('Total Auxilios No Salariales:', totalAux);

const assistances = [{
  assistanceS: "0.00",
  assistanceNS: totalAux.toFixed(2)
}];
console.log('assistances to be sent to MATIAS API:', assistances);
