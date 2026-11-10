const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const angelicaJson = {
  payroll_period_id: 5,
  settlement_type_id: 1,
  document_number: "366",
  prefix: "NOM",
  period: {
    settlement_start_date: "2026-09-01",
    settlement_end_date: "2026-09-30",
    amount_time: "15.00",
    date_issue: "2026-09-30",
    date_entry: "2024-02-15",
    departure_date: "2026-09-15",
    time_worked: "15"
  },
  worker: {
    type_worker_id: 1,
    sub_type_worker_id: 0,
    type_contract_id: 2,
    type_document_id: 1,
    municipality_id: 76001,
    payroll_type_document_id: 1,
    worker_code: "29682675",
    document_number: "29682675",
    surname: "MONCADA",
    second_surname: "ARMILLA",
    first_name: "ANGELICA",
    other_names: "",
    high_risk_pension: "false",
    integral_salary: "false",
    salary: "2174000.00",
    address: "CALLE 10 # 5-20"
  },
  payment: {
    payment_method_id: 1,
    bank_name: "Bancolombia",
    account_type: "Ahorros",
    account_number: "0000000000"
  },
  payment_dates: [
    "2026-09-30"
  ],
  accrued: {
    basic_payroll_data: {
      worked_days: "15",
      salary_worked: "1087000.00"
    },
    transport: {
      transportation_assistance: "124547.50",
      viatic_maintenance: "0.00",
      viatic_non_salary_maintenance: "0.00"
    },
    vacations: {
      paid: {
        amount: "11",
        payment: "797133.33"
      }
    },
    service_bonus: {
      amount: "1",
      payment: "504811.46"
    },
    severance: {
      amount: "1",
      percentage: "12.00",
      payment: "1716358.96",
      payment_interest: "145890.51"
    }
  },
  deductions: {
    eps_type: {
      percentage: "4.00",
      deduction: "43480.00"
    },
    pension_type: {
      percentage: "4.00",
      deduction: "43480.00"
    }
  },
  accrued_total: "4375741.76",
  deductions_total: "86960.00",
  payroll_total: "4288781.76"
};

const jsonStr = JSON.stringify(angelicaJson, null, 2);

db.prepare(`
  UPDATE electronic_payrolls 
  SET xml_generado = ?,
      total_devengos = 4375741.76,
      total_deducciones = 86960.00,
      total_neto = 4288781.76
  WHERE id = '8rmt1iurq72m1m0'
`).run(jsonStr);

console.log('Record 8rmt1iurq72m1m0 updated successfully.');
const updated = db.prepare('SELECT id, consecutivo, total_devengos, total_deducciones, total_neto, estado_dian FROM electronic_payrolls WHERE id = ?').get('8rmt1iurq72m1m0');
console.log('Updated row:', updated);
