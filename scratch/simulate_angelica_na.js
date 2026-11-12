const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Simular el proceso de preparación de la Nota de Ajuste de Reemplazo para Angélica
const empId = 'vsu8bz83547sxrn'; // Angelica Moncada

// 1. Obtener datos de nómina Q1
const plQ1 = db.prepare(`
  SELECT pl.*, p.name, p.date_from, p.date_to
  FROM payroll_lines pl
  JOIN payroll_periods p ON pl.period_id = p.id
  WHERE pl.employee_id = ? AND p.date_from >= '2026-09-01' AND p.date_to <= '2026-09-30'
`).all(empId);

console.log('Líneas de Nómina Q1 encontradas:', plQ1.length);

// 2. Obtener comprobante de liquidación definitiva LQ
const txLiq = db.prepare(`
  SELECT * FROM transactions WHERE cross_type = 'payroll_settlement' AND third_party_id = ?
`).all(empId);
console.log('Transacción LQ encontrada:', txLiq.map(t => ({ id: t.id, number: t.number, date: t.date })));

const txLinesLiq = db.prepare(`
  SELECT tl.*, a.code, a.name as acct_name
  FROM tx_lines tl
  LEFT JOIN accounts a ON tl.account_id = a.id
  WHERE tl.tx_id = ?
`).all(txLiq[0].id);

// 3. Simular mergeSettlementsIntoAccumulators
let cesantias = 0, intCes = 0, prima = 0, vacaciones = 0;
for (const l of txLinesLiq) {
  const code = l.code || '';
  const desc = (l.description || '').toLowerCase();
  const netDebit = l.debit - l.credit;
  if (code.startsWith('2370') || code.startsWith('510572') || desc.includes('caja') || desc.includes('ccf') || desc.includes('parafiscal')) continue;
  if (code.startsWith('261005') || code.startsWith('510530') || (desc.includes('cesant') && !desc.includes('interes'))) cesantias += netDebit;
  else if (code.startsWith('261010') || code.startsWith('510533') || desc.includes('interes')) intCes += netDebit;
  else if (code.startsWith('261020') || code.startsWith('510536') || desc.includes('prima')) prima += netDebit;
  else if (code.startsWith('261015') || code.startsWith('510539') || (desc.includes('vacacion') && !desc.includes('caja'))) vacaciones += netDebit;
}

console.log('\nConceptos de Liquidación Definitiva acumulados:');
console.log({
  cesantias: cesantias.toFixed(2),
  intCes: intCes.toFixed(2),
  prima: prima.toFixed(2),
  vacaciones: vacaciones.toFixed(2)
});

// 4. Totales consolidados acumulados
const basicQ1 = 1087000;
const transQ1 = 124547.5;
const saludQ1 = 43480;
const pensionQ1 = 43480;

const totalDev = basicQ1 + transQ1 + vacaciones + prima + cesantias + intCes;
const totalDed = saludQ1 + pensionQ1;
const totalNet = totalDev - totalDed;

console.log('\nTotales Consolidados Septiembre:');
console.log({
  totalDevengos: totalDev.toFixed(2),
  totalDeducciones: totalDed.toFixed(2),
  totalNeto: totalNet.toFixed(2)
});

// 5. Cargar builder backend para verificar el payload final hacia MATIAS API
const builder = require('../pb_hooks/dian_nomina_matias_builder.js');

const simulatedAjusteRec = {
  getString: (k) => {
    if (k === 'xml_generado') {
      return JSON.stringify({
        payroll_type: "replace",
        replacing_predecessor: {
          number: "NOM-374",
          cune: "add5323c21276f0da7d6b129eceb6041e494fc18ef5ed3724f7195f4c72979ed627feb8f68b8ed3166c60c20e35c540f",
          generation_date: "2026-09-30"
        },
        resolution_number: "18760000001",
        document_number: "5",
        generation_city_id: "1006",
        worker_code: "29682675",
        novelty: false,
        pay_day: "2026-09-30",
        period: {
          settlement_start_date: "2026-09-01",
          settlement_end_date: "2026-09-30",
          amount_time: "15.00",
          date_issue: "2026-09-30",
          date_entry: "2024-02-15",
          departure_date: "2026-09-15",
          time_worked: "15",
          generation_date: "2026-09-30"
        },
        employee: {
          worker_type_id: 1,
          worker_subtype_id: 1,
          contract_type_id: 2,
          identity_document_id: "1",
          document_number: "29682675",
          first_surname: "MONCADA",
          second_surname: "ARMILLA",
          first_name: "ANGELICA",
          work_city_id: 1032,
          salary: "2174000.00",
          worker_code: "29682675"
        },
        payment: {
          payment_method_id: 1,
          means_payment_id: "30",
          bank: "Bancolombia",
          account_type: "Ahorros",
          account_number: "91280570864"
        },
        earn: {
          basic: { worked_days: "15", salary_worked: basicQ1.toFixed(2) },
          transport: { transportation_assistance: transQ1.toFixed(2) },
          vacations: { paid: { amount: "11", payment: vacaciones.toFixed(2) } },
          bonus: { amount: "1", payment: prima.toFixed(2), non_salary_payment: "0.00" },
          cesantias: { payment: cesantias.toFixed(2), percentage: "12.00", interest_payment: intCes.toFixed(2) }
        },
        deductions: {
          health: { percentage: "4.00", deduction: saludQ1.toFixed(2) },
          pension_fund: { percentage: "4.00", deduction: pensionQ1.toFixed(2) }
        },
        total_earned: totalDev.toFixed(2),
        deductions_total: totalDed.toFixed(2),
        total_voucher: totalNet.toFixed(2)
      });
    }
    if (k === 'prefijo') return 'NANE';
    if (k === 'employee_id') return empId;
    return '';
  },
  getInt: (k) => k === 'consecutivo' ? 5 : 0,
  set: () => {}
};

const result = builder.buildMatiasPayrollPayloadFromRec(simulatedAjusteRec, true, 'NANE', 5);

console.log('\n--- VERIFICACIÓN DEL PAYLOAD QUE VIAJARÁ A MATIAS API ---');
console.log('Endpoint:', result.endpoint);
console.log('type_xml_id:', result.payload.general_information?.type_xml_id);
console.log('Predecesor referenciado:', result.payload.replacing_predecessor);
console.log('Devengados en payload:');
console.log(JSON.stringify(result.payload.earn, null, 2));

const bonusOk = result.payload.earn.bonus && result.payload.earn.bonus.payment === '504811.46';
const cesantiasOk = result.payload.earn.cesantias && result.payload.earn.cesantias.payment === '1716358.96' && result.payload.earn.cesantias.interest_payment === '145890.51';
const vacOk = result.payload.earn.vacations?.paid?.payment === '797133.33';
const endpointOk = result.endpoint === '/api/ubl2.1/ep/payroll/replace';

console.log('\n--- CONCLUSIÓN ---');
console.log('Prima lista para firmar ($504.811,46):', bonusOk ? '✅ SÍ' : '❌ NO');
console.log('Cesantías listas para firmar ($1.716.358,96):', cesantiasOk ? '✅ SÍ' : '❌ NO');
console.log('Intereses listos para firmar ($145.890,51):', cesantiasOk ? '✅ SÍ' : '❌ NO');
console.log('Vacaciones compensadas listas ($797.133,33):', vacOk ? '✅ SÍ' : '❌ NO');
console.log('Endpoint de reemplazo oficial:', endpointOk ? '✅ SÍ' : '❌ NO');

