const fs = require('fs');

const targetFiles = [
  'pb_hooks/dian.pb.js',
  'empresas/pb_hooks/dian.pb.js',
  'empresas/empresa_8091/pb_hooks/dian.pb.js',
  'empresas/empresa_8092/pb_hooks/dian.pb.js',
  'empresas/empresa_8093/pb_hooks/dian.pb.js',
  'empresas/empresa_8094/pb_hooks/dian.pb.js'
];

const helperCode = `function buildNominaPayrollPayload(rec) {
  let getSetting = (k, def) => {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(k || '').replace(/'/g, "''") + "'");
      return (r ? r.get("value") : null) || def;
    } catch (_) {
      return def;
    }
  };

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

  let formatNumeroALetras = function(num) {
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
  };

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

const newDownloadPdfRoute = `routerAdd('POST', '/api/dian/nomina/download-pdf', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const recordId = body.id || body.electronicPayrollId;
    if (!recordId) {
      return e.json(400, { message: "ID de registro de nómina electrónica no especificado." });
    }

    const rec = $app.findRecordById("electronic_payrolls", recordId);
    if (!rec) {
      return e.json(404, { message: "Registro de nómina electrónica no encontrado." });
    }

    const prefijo = rec.getString("prefijo") || "NOM";
    const consecutivo = rec.getInt("consecutivo") || 1;
    const filename = \`NominaIndividual_\${prefijo}-\${consecutivo}.pdf\`;

    const payrollData = buildNominaPayrollPayload(rec);

    const pdfRes = $http.send({
      url: "http://127.0.0.1:8088/api/dian/generate-pdf",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        xmlContent: rec.getString("xml_generado") || "",
        filename: \`\${prefijo}-\${consecutivo}\`,
        isNomina: true,
        payrollData: payrollData
      })
    });

    if (pdfRes.statusCode === 200) {
      const pdfB64 = $security.base64Encode(pdfRes.raw);
      return e.json(200, {
        success: true,
        pdfBase64: pdfB64,
        filename: filename
      });
    } else {
      throw new Error("El orquestador no pudo generar el PDF: " + pdfRes.raw);
    }
  } catch (err) {
    console.error("[GRAVY HOOK] Error al generar PDF de nómina:", err);
    return e.json(500, { message: "Error al generar PDF: " + err.message });
  }
});`;

targetFiles.forEach((file) => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Insert helper if not present
  if (!c.includes('function buildNominaPayrollPayload(')) {
    c = c.replace(
      "routerAdd('POST', '/api/dian/nomina/resend-email', (e) => {",
      helperCode + "\n\nrouterAdd('POST', '/api/dian/nomina/resend-email', (e) => {"
    );
  }

  // Update resend-email to use buildNominaPayrollPayload
  c = c.replace(
    /payrollData:\s*\{[\s\S]*?totalNeto:\s*totalNeto\s*\}/,
    'payrollData: buildNominaPayrollPayload(rec)'
  );

  // Replace download-pdf route
  const startDl = c.indexOf("routerAdd('POST', '/api/dian/nomina/download-pdf', (e) => {");
  if (startDl !== -1) {
    const endDlMarker = "// Sincronizar resoluciones y prefijos autorizados desde MATIAS API";
    const endDl = c.indexOf(endDlMarker, startDl);
    if (endDl !== -1) {
      c = c.slice(0, startDl) + newDownloadPdfRoute + "\n\n" + c.slice(endDl);
    }
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('Patched ' + file);
});

console.log('Finished updating all dian.pb.js files.');

