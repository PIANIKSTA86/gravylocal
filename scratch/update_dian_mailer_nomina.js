const fs = require('fs');

const mailerFiles = [
  'pb_hooks/dian_mailer.js',
  'empresas/pb_hooks/dian_mailer.js',
  'empresas/empresa_8091/pb_hooks/dian_mailer.js',
  'empresas/empresa_8092/pb_hooks/dian_mailer.js',
  'empresas/empresa_8093/pb_hooks/dian_mailer.js',
  'empresas/empresa_8094/pb_hooks/dian_mailer.js'
];

const dianFiles = [
  'pb_hooks/dian.pb.js',
  'empresas/pb_hooks/dian.pb.js',
  'empresas/empresa_8091/pb_hooks/dian.pb.js',
  'empresas/empresa_8092/pb_hooks/dian.pb.js',
  'empresas/empresa_8093/pb_hooks/dian.pb.js',
  'empresas/empresa_8094/pb_hooks/dian.pb.js'
];

const payloadHelperCode = `
function formatNumeroALetras(num) {
  const tempNum = parseFloat(String(num || 0)).toFixed(2).split('.');
  const entero = parseInt(tempNum[0], 10);
  const centavos = tempNum[1];
  if (entero === 0) return 'CERO PESOS M/CTE CON ' + centavos + '/100';

  function letras(n) {
    if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
    if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
    if (n < 30) return n === 20 ? 'Veinte' : 'Veinti' + letras(n - 20).toLowerCase();
    if (n < 100) {
      const u = n % 10;
      const d = Math.floor(n / 10);
      const decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
      return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
    }
    if (n < 1000) {
      const d_u = n % 100;
      const c = Math.floor(n / 100);
      const centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
      if (n === 100) return 'Cien';
      if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
      return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
    }
    if (n < 1000000) {
      const mil = Math.floor(n / 1000);
      const resto = n % 1000;
      const t = mil === 1 ? 'Mil' : letras(mil) + ' mil';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    if (n < 1000000000) {
      const millon = Math.floor(n / 1000000);
      const resto = n % 1000000;
      const t = millon === 1 ? 'Un millón' : letras(millon) + ' millones';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    return String(n);
  }

  return (letras(entero) + ' PESOS M/CTE CON ' + centavos + '/100').toUpperCase();
}

function buildNominaPayrollPayload(rec) {
  const prefijo = rec.getString("prefijo") || "NOM";
  const consecutivo = rec.getInt("consecutivo") || 1;
  const docNumber = \`\${prefijo}-\${consecutivo}\`;
  const cune = rec.getString("cufe") || "—";
  const xmlGenerado = rec.getString("xml_generado") || "";
  const totalDevengos = rec.getFloat("total_devengos") || 0;
  const totalDeducciones = rec.getFloat("total_deducciones") || 0;
  const totalNeto = rec.getFloat("total_neto") || (totalDevengos - totalDeducciones);

  let emp = null;
  const empId = rec.getString("employee_id");
  if (empId) {
    try { emp = $app.findRecordById("third_parties", empId); } catch (_) {}
    if (!emp) {
      try { emp = $app.findRecordById("employees", empId); } catch (_) {}
    }
  }

  let empRule = {};
  if (emp) {
    try {
      const parts = $app.findRecordsByFilter("settings", "key ~ 'payroll_accounting_config_v1_employee_rules%'");
      if (parts && parts.length > 0) {
        let allRulesJson = "";
        parts.forEach((p) => { allRulesJson += (p.getString("value") || ""); });
        const parsedRules = JSON.parse(allRulesJson);
        const found = parsedRules.find((r) => r.employee_id === emp.id);
        if (found) empRule = found;
      }
    } catch (_) {}
  }

  const resolveThirdName = (id) => {
    if (!id) return "";
    try {
      const t = $app.findRecordById("third_parties", id);
      return t ? (t.getString("name") || t.getString("commercial_name") || "") : "";
    } catch (_) {
      return "";
    }
  };

  const epsName = resolveThirdName(empRule.tercero_salud_id);
  const afpName = resolveThirdName(empRule.tercero_pension_id);
  const arlName = resolveThirdName(empRule.tercero_arl_id);
  const cajaName = resolveThirdName(empRule.tercero_caja_id);

  const arlRates = { 1: "0.522%", 2: "1.044%", 3: "2.436%", 4: "4.350%", 5: "6.960%" };
  const arlRiskLevel = empRule.arl_risk_level || 1;
  const arlRate = arlRates[arlRiskLevel] || "0.522%";

  let empName = emp ? (emp.getString("name") || emp.getString("first_name") || "Colaborador") : "Colaborador";
  let empDoc = emp ? (emp.getString("doc_number") || "") : "";

  return {
    companyName: getSetting("company_name", "DOMESTIKO SAS"),
    companyNit: getSetting("company_nit", "901428834"),
    companyAddress: getSetting("company_address", ""),
    empName: empName,
    empDoc: empDoc,
    cargo: emp ? (emp.getString("cargo") || emp.getString("notes") || "Colaborador") : "Colaborador",
    costCenter: emp ? (emp.getString("cost_center") || "General / Colaboradores") : "General / Colaboradores",
    basicSalary: empRule.basic_salary || (emp ? emp.getFloat("salary_base") : 0) || 1750905,
    bankName: emp ? (emp.getString("bank_name") || "Bancolombia") : "Bancolombia",
    bankAccountType: emp ? (emp.getString("bank_account_type") || "Ahorros") : "Ahorros",
    bankAccount: emp ? (emp.getString("bank_account") || "06185364532") : "06185364532",
    dateHired: emp ? (emp.getString("date_hired") || "2026-01-01") : "2026-01-01",
    paymentMethod: emp ? (emp.getString("payment_method") || "42 - Consignación Bancaria") : "42 - Consignación Bancaria",
    healthEntity: epsName || (emp ? emp.getString("eps") : "") || "EPS SURA",
    pensionEntity: afpName || (empRule.is_pensioner ? "Pensionado (Exento)" : (emp ? emp.getString("afp") : "")) || "Pensionado (Exento)",
    arlEntity: arlName ? \`\${arlName} - Riesgo \${arlRiskLevel} (\${arlRate})\` : ((emp ? emp.getString("arl") : "") || "ARL SURA - Riesgo 1 (0.522%)"),
    cajaEntity: cajaName || (emp ? emp.getString("caja_compensacion") : "") || "CCF COMFENALCO DEL VALLE DEL CAUCA - COMFENALCO VALLE",
    fechasPago: "2026-09-30",
    issueDate: rec.getString("fecha_envio") || "2026-10-09 15:42:03 12:00:00-05:00",
    cune: cune,
    totalDevengos: totalDevengos,
    totalDeducciones: totalDeducciones,
    totalNeto: totalNeto,
    valorEnLetras: formatNumeroALetras(totalNeto)
  };
}
`;

// 1. Update dian_mailer.js files
mailerFiles.forEach((file) => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  if (!c.includes('function buildNominaPayrollPayload(')) {
    // Insert before module.exports
    c = c.replace('module.exports = {', payloadHelperCode + '\nmodule.exports = {');
    c = c.replace('sendInvoiceEmailHelper\n};', 'sendInvoiceEmailHelper,\n  formatNumeroALetras,\n  buildNominaPayrollPayload\n};');
    c = c.replace('sendInvoiceEmailHelper\r\n};', 'sendInvoiceEmailHelper,\r\n  formatNumeroALetras,\r\n  buildNominaPayrollPayload\r\n};');
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('Updated ' + file);
});

// 2. Update dian.pb.js files
dianFiles.forEach((file) => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Update download-pdf to load from mailer
  const oldDlCall = 'const payrollData = buildNominaPayrollPayload(rec);';
  const newDlCall = `let buildPayload = null;
    try {
      const mailer = require(\`\${__hooks}/dian_mailer.js\`);
      if (mailer.buildNominaPayrollPayload) buildPayload = mailer.buildNominaPayrollPayload;
    } catch (_) {}
    if (!buildPayload && typeof buildNominaPayrollPayload === 'function') buildPayload = buildNominaPayrollPayload;

    const payrollData = buildPayload ? buildPayload(rec) : {};`;

  if (c.includes(oldDlCall)) {
    c = c.replace(oldDlCall, newDlCall);
  }

  // Update resend-email to load from mailer
  const oldResendCall = 'payrollData: buildNominaPayrollPayload(rec)';
  const newResendCall = `payrollData: (function() {
          let fn = null;
          try {
            const m = require(\`\${__hooks}/dian_mailer.js\`);
            if (m.buildNominaPayrollPayload) fn = m.buildNominaPayrollPayload;
          } catch (_) {}
          if (!fn && typeof buildNominaPayrollPayload === 'function') fn = buildNominaPayrollPayload;
          return fn ? fn(rec) : {};
        })()`;

  if (c.includes(oldResendCall)) {
    c = c.replace(oldResendCall, newResendCall);
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('Updated ' + file);
});

console.log('Finished updating dian_mailer.js and dian.pb.js files.');

