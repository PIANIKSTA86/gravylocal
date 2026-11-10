const builder = require('../pb_hooks/dian_nomina_matias_builder.js');

const rawJson = JSON.stringify({
  payroll_period_id: 5,
  document_number: '381',
  prefix: 'NOM',
  worker: {
    document_number: '29682675',
    first_name: 'ANGELICA',
    surname: 'MONCADA',
    second_surname: 'ARMILLA',
    salary: '2174000.00',
    municipality_id: 76001
  },
  period: {
    settlement_start_date: '2026-09-01',
    settlement_end_date: '2026-09-30',
    date_entry: '2024-02-15',
    departure_date: '2026-09-15'
  },
  accrued: { basic: { worked_days: '15', salary_worked: '1087000.00' } },
  accrued_total: '4375741.76',
  deductions_total: '86960.00',
  payroll_total: '4288781.76'
});

const fakeRec = {
  getString: (k) => k === 'xml_generado' ? rawJson : '',
  getInt: (k) => 381,
  getFloat: (k) => 0,
  set: (k, v) => {}
};

global.$app = {
  findFirstRecordByFilter: () => ({ getString: () => '18760000001' }),
  findRecordsByFilter: () => []
};

const res = builder.buildMatiasPayrollPayloadFromRec(fakeRec, false, 'NOM', 381);
console.log('Endpoint:', res.endpoint);
console.log('Keys in payload:', Object.keys(res.payload));
console.log('Has resolution_number:', !!res.payload.resolution_number, res.payload.resolution_number);
console.log('Has general_information:', !!res.payload.general_information);
console.log('Has employee:', !!res.payload.employee, res.payload.employee?.first_name, res.payload.employee?.first_surname);
console.log('Has earn:', !!res.payload.earn);
console.log('Has total_earned:', !!res.payload.total_earned, res.payload.total_earned);
console.log('Has total_voucher:', !!res.payload.total_voucher, res.payload.total_voucher);
