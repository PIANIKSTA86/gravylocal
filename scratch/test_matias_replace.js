const builder = require('../pb_hooks/dian_nomina_matias_builder.js');

const replaceRecord = {
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
        document_number: "1",
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
          salary: "2174000.00"
        },
        earn: {
          basic: { worked_days: "15", salary_worked: "1087000.00" },
          transport: { transportation_assistance: "124547.50" },
          vacations: { paid: { amount: "11", payment: "797133.33" } },
          bonus: { amount: "1", payment: "504811.46", non_salary_payment: "0.00" },
          cesantias: { payment: "1716358.96", percentage: "12.00", interest_payment: "145890.51" }
        },
        deductions: {
          health: { percentage: "4.00", deduction: "43480.00" },
          pension_fund: { percentage: "4.00", deduction: "43480.00" }
        },
        total_earned: "4375741.76",
        deductions_total: "86960.00",
        total_voucher: "4288781.76"
      });
    }
    if (k === 'prefijo') return 'NANE';
    return '';
  },
  getInt: (k) => k === 'consecutivo' ? 1 : 0,
  set: () => {}
};

const res = builder.buildMatiasPayrollPayloadFromRec(replaceRecord, true, 'NANE', 1);
console.log('--- TEST REEMPLAZO MATIAS API ---');
console.log('Endpoint:', res.endpoint);
console.log('Tiene replacing_predecessor:', Boolean(res.payload.replacing_predecessor));
console.log('Predecessor number:', res.payload.replacing_predecessor?.number);
console.log('type_xml_id:', res.payload.general_information?.type_xml_id);

const replaceOk = res.endpoint === '/api/ubl2.1/ep/payroll/replace' &&
  res.payload.replacing_predecessor &&
  res.payload.general_information?.type_xml_id === 103;

console.log('Resultado Reemplazo:', replaceOk ? '✅ PASÓ' : '❌ FALLÓ');
if (!replaceOk) process.exit(1);

