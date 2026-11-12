const fs = require('fs');

// Cargar el builder de pb_hooks
const builder = require('../pb_hooks/dian_nomina_matias_builder.js');

console.log('--- TEST DE CUMPLIMIENTO 100% MATIAS API ---');

// Mock record que almacena un JSON generado con conceptos variados
const testRecord = {
  getString: (k) => {
    if (k === 'xml_generado') {
      return JSON.stringify({
        resolution_number: "18760000001",
        document_number: "374",
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
        general_information: {
          generation_date: "2026-09-30",
          generation_time: "10:00:00",
          period_id: 5,
          currency_id: 272,
          trm: "0",
          type_xml_id: 102
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
          other_names: "",
          working_country_id: 45,
          work_city_id: 1032,
          work_address: "CR 24 A 19 37",
          high_risk_pension: "false",
          integral_salary: "false",
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
          basic: { worked_days: "15", salary_worked: "1087000.00" },
          transport: { transportation_assistance: "124547.50" },
          vacations: {
            paid: { amount: "11", payment: "797133.33" }
          },
          // Claves MATIAS API
          bonus: { amount: "1", payment: "504811.46", non_salary_payment: "0.00" },
          cesantias: { payment: "1716358.96", percentage: "12.00", interest_payment: "145890.51" },
          // Claves adicionales para probar normalización
          vouchers: [{ payment: "50000.00" }],
          indemnities: [{ indemnity: "200000.00" }],
          telecommuting: "100000.00"
        },
        deductions: {
          health: { percentage: "4.00", deduction: "43480.00" },
          pension_fund: { percentage: "4.00", deduction: "43480.00" },
          labor_union: [{ percentage: "1.00", deduction: "10000.00" }],
          orders: [{ description: "Libranza", deduction: "30000.00" }]
        },
        total_earned: "4375741.76",
        deductions_total: "86960.00",
        total_voucher: "4288781.76"
      });
    }
    if (k === 'prefijo') return 'NOM';
    if (k === 'employee_id') return 'emp1';
    return '';
  },
  getInt: (k) => k === 'consecutivo' ? 374 : 0,
  set: () => {}
};

// Ejecutar builder
const { endpoint, payload } = builder.buildMatiasPayrollPayloadFromRec(testRecord, false, 'NOM', 374);

console.log('Endpoint objetivo:', endpoint);
console.log('Payload generado para MATIAS API:');
console.log(JSON.stringify(payload, null, 2));

// Validaciones estrictas:
const assertions = [
  ['Endpoint correcto', endpoint === '/api/ubl2.1/ep/payroll'],
  ['resolution_number presente', typeof payload.resolution_number === 'string'],
  ['generation_city_id es string numérico', /^\d+$/.test(payload.generation_city_id)],
  ['earn.bonus existe y tiene payment y amount', payload.earn.bonus && payload.earn.bonus.payment === '504811.46' && payload.earn.bonus.amount === '1'],
  ['earn.cesantias existe y tiene payment, percentage, interest_payment', payload.earn.cesantias && payload.earn.cesantias.payment === '1716358.96' && payload.earn.cesantias.interest_payment === '145890.51'],
  ['earn.service_bonus fue eliminado (no contamina)', payload.earn.service_bonus === undefined],
  ['earn.severance fue eliminado (no contamina)', payload.earn.severance === undefined],
  ['earn.bondEPCTVs normalizado desde vouchers', Array.isArray(payload.earn.bondEPCTVs) && payload.earn.bondEPCTVs[0].paymentNS === '50000.00'],
  ['earn.indemnification normalizado desde indemnities', payload.earn.indemnification === '200000.00'],
  ['earn.teleworking normalizado desde telecommuting', payload.earn.teleworking === '100000.00'],
  ['deductions.trade_union normalizado desde labor_union', Array.isArray(payload.deductions.trade_union) && payload.deductions.trade_union[0].deduction === '10000.00'],
  ['deductions.libranzas normalizado desde orders', Array.isArray(payload.deductions.libranzas) && payload.deductions.libranzas[0].deduction === '30000.00'],
  ['employee.worker_subtype_id es 1 (no 0)', payload.employee.worker_subtype_id === 1]
];

console.log('\n--- RESULTADOS DE VALIDACIÓN ---');
let allPassed = true;
assertions.forEach(([desc, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${desc}`);
  if (!passed) allPassed = false;
});

if (allPassed) {
  console.log('\n🌟 CERTIFICACIÓN: Todos los 13 chequeos de cumplimiento con MATIAS API pasaron al 100%.');
} else {
  console.error('\n⚠️ Hubo fallos de cumplimiento.');
  process.exit(1);
}

