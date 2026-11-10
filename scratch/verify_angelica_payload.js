const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// 1. Simular la lógica de consolidación exacta de mergeSettlementsIntoAccumulators
const year = 2026;
const month = 9;
const ymPrefix = '2026-09';
const mStart = '2026-09-01';
const mEnd = '2026-09-30';

// Cargar períodos de nómina de septiembre
const periods = db.prepare("SELECT * FROM payroll_periods WHERE date_from LIKE '2026-09%' OR date_to LIKE '2026-09%'").all();
const periodIds = periods.map(p => `'${p.id}'`).join(',');
const lines = db.prepare(`SELECT * FROM payroll_lines WHERE period_id IN (${periodIds})`).all();

// Cargar config de contratos
const settings = db.prepare("SELECT * FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%'").all();
settings.sort((a, b) => a.key.localeCompare(b.key));
let allRulesJson = '';
settings.forEach(s => allRulesJson += s.value);
const rules = JSON.parse(allRulesJson);
const ruleMap = new Map(rules.map(r => [r.employee_id, r]));

// Acumuladores
const acumuladosPorEmpleado = new Map();

for (const l of lines) {
  const empId = l.employee_id;
  const empRule = ruleMap.get(empId);
  const emp = db.prepare('SELECT * FROM third_parties WHERE id = ?').get(empId);
  if (!emp) continue;

  const days = Number(l.days_worked || 30);
  const proportionalSalary = Math.round(((Number(l.salary_base || 0)) / 30) * days * 100) / 100;
  const dev = proportionalSalary + Number(l.transport_allowance || 0);
  const ded = Number(l.deduction_health || 0) + Number(l.deduction_pension || 0);
  const net = Math.round((dev - ded) * 100) / 100;

  const existing = acumuladosPorEmpleado.get(empId);
  if (existing) {
    existing.sueldoBasico += proportionalSalary;
    existing.totalDevengos += dev;
    existing.totalDeducciones += ded;
    existing.netoPagar += net;
    existing.diasLaborados += days;
    existing.auxilioTransporte += Number(l.transport_allowance || 0);
    existing.saludDeduccion += Number(l.deduction_health || 0);
    existing.pensionDeduccion += Number(l.deduction_pension || 0);
  } else {
    acumuladosPorEmpleado.set(empId, {
      empId,
      nombreCompleto: emp.name,
      primerNombre: 'ANGELICA',
      primerApellido: 'MONCADA',
      segundoApellido: 'ARMILLA',
      tipoDocumento: emp.doc_type || 'CC',
      numeroDocumento: emp.doc_number,
      fechaIngreso: empRule?.start_date || '2026-01-01',
      fechaRetiro: null,
      diasLaborados: days,
      sueldoBasico: proportionalSalary,
      salarioContrato: Number(empRule?.basic_salary || l.salary_base || 0),
      auxilioTransporte: Number(l.transport_allowance || 0),
      saludDeduccion: Number(l.deduction_health || 0),
      pensionDeduccion: Number(l.deduction_pension || 0),
      totalDevengos: dev,
      totalDeducciones: ded,
      netoPagar: net,
      cesantiasMonto: 0,
      interesesCesantiasMonto: 0,
      primaMonto: 0,
      vacacionesCompensadasMonto: 0,
      vacacionesCompensadasDias: 0,
      indemnizacionMonto: 0
    });
  }
}

console.log('Antes de fusionar finiquito (Angelica):', acumuladosPorEmpleado.get('vsu8bz83547sxrn'));

// 2. Ejecutar lógica de mergeSettlementsIntoAccumulators
const settlementTxs = db.prepare(`
  SELECT * FROM transactions 
  WHERE cross_type = 'payroll_settlement' AND date >= ? AND date <= ? AND status != 'void' AND status != 'cancelled'
`).all(mStart, mEnd);

for (const tx of settlementTxs) {
  const empId = tx.third_party_id;
  const txLines = db.prepare(`
    SELECT tl.*, a.code as acct_code 
    FROM tx_lines tl 
    LEFT JOIN accounts a ON tl.account_id = a.id 
    WHERE tl.tx_id = ?
  `).all(tx.id);

  let cesantias = 0;
  let intCes = 0;
  let prima = 0;
  let vacaciones = 0;
  let indemnizacion = 0;

  for (const l of txLines) {
    const code = String(l.acct_code || '');
    const desc = String(l.description || '').toLowerCase();
    const debit = Number(l.debit || 0);
    const credit = Number(l.credit || 0);
    const netDebit = debit - credit;

    if (code.startsWith('2370') || code.startsWith('510572') || desc.includes('caja') || desc.includes('ccf') || desc.includes('parafiscal')) {
      continue;
    }

    if (code.startsWith('261005') || code.startsWith('510530') || (desc.includes('cesant') && !desc.includes('interes'))) {
      cesantias += netDebit;
    } else if (code.startsWith('261010') || code.startsWith('510533') || desc.includes('interes')) {
      intCes += netDebit;
    } else if (code.startsWith('261020') || code.startsWith('510536') || desc.includes('prima')) {
      prima += netDebit;
    } else if (code.startsWith('261015') || code.startsWith('510539') || (desc.includes('vacacion') && !desc.includes('caja'))) {
      vacaciones += netDebit;
    } else if (code.startsWith('510527') || desc.includes('indemniz')) {
      indemnizacion += netDebit;
    }
  }

  let retiroDate = tx.date;
  const match = tx.description?.match(/Retiro:\s*(\d{4}-\d{2}-\d{2})/i) || tx.cross_number?.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) retiroDate = match[1];

  const empRule = ruleMap.get(empId);
  const salary = Number(empRule?.basic_salary || 0);
  let vacDays = 0;
  if (salary > 0 && vacaciones > 0) {
    vacDays = Math.round((vacaciones / (salary / 30)) * 100) / 100;
  }
  if (vacDays <= 0 && vacaciones > 0) vacDays = 1;

  const existing = acumuladosPorEmpleado.get(empId);
  if (existing) {
    existing.fechaRetiro = retiroDate;
    existing.cesantiasMonto = Math.round((existing.cesantiasMonto + cesantias) * 100) / 100;
    existing.interesesCesantiasMonto = Math.round((existing.interesesCesantiasMonto + intCes) * 100) / 100;
    existing.primaMonto = Math.round((existing.primaMonto + prima) * 100) / 100;
    existing.vacacionesCompensadasMonto = Math.round((existing.vacacionesCompensadasMonto + vacaciones) * 100) / 100;
    existing.vacacionesCompensadasDias = existing.vacacionesCompensadasDias + vacDays;
    existing.indemnizacionMonto = Math.round((existing.indemnizacionMonto + indemnizacion) * 100) / 100;

    const totalLiqDevengos = Math.round((cesantias + intCes + prima + vacaciones + indemnizacion) * 100) / 100;
    existing.totalDevengos = Math.round((existing.totalDevengos + totalLiqDevengos) * 100) / 100;
    existing.netoPagar = Math.round((existing.totalDevengos - existing.totalDeducciones) * 100) / 100;
  }
}

console.log('\nDespués de fusionar finiquito (Angelica):', acumuladosPorEmpleado.get('vsu8bz83547sxrn'));

// 3. Simular buildMatiasPayrollPayload
const angelica = acumuladosPorEmpleado.get('vsu8bz83547sxrn');
const company = {
  companyName: 'LUBRICANTES Y FILTROS SAS',
  companyNit: '900123456',
  companyDv: '1',
  prefijo: 'NOM',
  cityCode: '76001',
  companyDir: 'CALLE 10 # 5-20'
};

const matiasPayload = {
  payroll_period_id: 5,
  settlement_type_id: 1,
  document_number: "366",
  prefix: "NOM",
  period: {
    settlement_start_date: "2026-09-01",
    settlement_end_date: "2026-09-30",
    amount_time: `${angelica.diasLaborados}.00`,
    date_issue: "2026-09-30",
    date_entry: angelica.fechaIngreso,
    departure_date: angelica.fechaRetiro,
    time_worked: String(angelica.diasLaborados)
  },
  worker: {
    type_worker_id: 1,
    sub_type_worker_id: 0,
    type_contract_id: 2,
    type_document_id: 1,
    municipality_id: 76001,
    payroll_type_document_id: 1,
    worker_code: angelica.numeroDocumento,
    document_number: angelica.numeroDocumento,
    surname: angelica.primerApellido,
    second_surname: angelica.segundoApellido,
    first_name: angelica.primerNombre,
    other_names: "",
    high_risk_pension: "false",
    integral_salary: "false",
    salary: angelica.salarioContrato.toFixed(2),
    address: "CALLE 10 # 5-20"
  },
  payment: {
    payment_method_id: 1,
    bank_name: "Bancolombia",
    account_type: "Ahorros",
    account_number: "0000000000"
  },
  payment_dates: ["2026-09-30"],
  accrued: {
    basic_payroll_data: {
      worked_days: String(angelica.diasLaborados),
      salary_worked: angelica.sueldoBasico.toFixed(2)
    },
    transport: {
      transportation_assistance: angelica.auxilioTransporte.toFixed(2),
      viatic_maintenance: "0.00",
      viatic_non_salary_maintenance: "0.00"
    },
    vacations: {
      paid: {
        amount: String(angelica.vacacionesCompensadasDias),
        payment: angelica.vacacionesCompensadasMonto.toFixed(2)
      }
    },
    service_bonus: {
      amount: "1",
      payment: angelica.primaMonto.toFixed(2)
    },
    severance: {
      amount: "1",
      percentage: "12.00",
      payment: angelica.cesantiasMonto.toFixed(2),
      payment_interest: angelica.interesesCesantiasMonto.toFixed(2)
    }
  },
  deductions: {
    eps_type: {
      percentage: "4.00",
      deduction: angelica.saludDeduccion.toFixed(2)
    },
    pension_type: {
      percentage: "4.00",
      deduction: angelica.pensionDeduccion.toFixed(2)
    }
  },
  accrued_total: angelica.totalDevengos.toFixed(2),
  deductions_total: angelica.totalDeducciones.toFixed(2),
  payroll_total: angelica.netoPagar.toFixed(2)
};

console.log('\nPayload JSON UBL 2.1 MATIAS para Angélica Moncada (Septiembre):');
console.log(JSON.stringify(matiasPayload, null, 2));

