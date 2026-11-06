/**
 * GRAVY ERP — Generador de Payloads JSON UBL 2.1 para MATIAS API (Nómina y Notas de Ajuste)
 * Archivo: pb_hooks/dian_nomina_matias_builder.js
 * Compatible con Goja Runtime via require(`${__hooks}/dian_nomina_matias_builder.js`)
 */

function getAttrFromXml(xml, tag, attr, sourceStr) {
  const str = sourceStr || xml || '';
  if (!str) return '';
  const tm = str.match(new RegExp('<' + tag + '[^>]*>', 'i'));
  if (!tm) return '';
  const am = tm[0].match(new RegExp(attr + '\\s*=\\s*"([^"]*)"', 'i'));
  return am ? am[1] : '';
}

function getTagValFromXml(xml, tag, sourceStr) {
  const str = sourceStr || xml || '';
  if (!str) return '';
  const m = str.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
  return m ? m[1].trim() : '';
}

function buildMatiasPayrollPayloadFromRec(rec, isAjusteDoc, prefijo, consecutivo) {
  const xml = rec.getString("xml_generado") || "";
  const tipoNota = getTagValFromXml(xml, "TipoNota");

  // Determinar resolución oficial según tipo de documento
  let resNumber = "18760000001";
  let targetPrefix = prefijo || "";
  try {
    const resType = isAjusteDoc ? "NANE" : "NE";
    const resRow = $app.findFirstRecordByFilter("dian_resolutions", "document_type = '" + resType + "' && active = true");
    if (resRow) {
      resNumber = resRow.getString("resolution_number") || resNumber;
      if (!targetPrefix || (isAjusteDoc && (targetPrefix === "NA" || targetPrefix === "AJ"))) {
        targetPrefix = resRow.getString("prefix") || (isAjusteDoc ? "NANE" : "NOM");
        rec.set("prefijo", targetPrefix);
      }
    }
  } catch (_) {}

  if (!targetPrefix) {
    targetPrefix = isAjusteDoc ? "NANE" : "NOM";
    rec.set("prefijo", targetPrefix);
  }

  // Caso 1: Nota de Ajuste de Nómina — Tipo 2 (Eliminación)
  if (isAjusteDoc && (tipoNota === "2" || xml.includes("<Eliminando>"))) {
    const elimMatch = xml.match(/<Eliminar>([\s\S]*?)<\/Eliminar>/i);
    const elimBlock = elimMatch ? elimMatch[1] : xml;

    const predNum = getAttrFromXml(xml, "NumeroSecuenciaXML", "Numero", elimBlock) ||
                   (getAttrFromXml(xml, "NumeroSecuenciaXML", "Prefijo", elimBlock) + getAttrFromXml(xml, "NumeroSecuenciaXML", "Consecutivo", elimBlock));
    const predCune = getTagValFromXml(xml, "CUNEPred", elimBlock);
    const predFecha = getTagValFromXml(xml, "FechaGenPred", elimBlock) || new Date().toISOString().slice(0, 10);

    return {
      endpoint: "/api/ubl2.1/ep/payroll/delete",
      payload: {
        document_number: String(consecutivo),
        prefix: targetPrefix,
        resolution_number: resNumber,
        deleting_predecessor: {
          number: predNum,
          cune: predCune,
          generation_date: predFecha
        }
      }
    };
  }

  // Caso 2 y 3: Nota de Ajuste Reemplazo (Tipo 1) o Nómina Individual Ordinaria
  const isReplace = isAjusteDoc && (tipoNota === "1" || xml.includes("<Reemplazando>"));
  const endpoint = isReplace ? "/api/ubl2.1/ep/payroll/replace" : "/api/ubl2.1/ep/payroll";

  // Periodo
  const dateEntry = getAttrFromXml(xml, "Periodo", "FechaIngreso") || "2026-01-01";
  const settlementStart = getAttrFromXml(xml, "Periodo", "FechaLiquidacionInicio") || (rec.getInt("ano") + "-" + String(rec.getInt("mes")).padStart(2, '0') + "-01");
  const settlementEnd = getAttrFromXml(xml, "Periodo", "FechaLiquidacionFin") || (rec.getInt("ano") + "-" + String(rec.getInt("mes")).padStart(2, '0') + "-30");
  const timeWorked = getAttrFromXml(xml, "Periodo", "TiempoLaborado") || "30";

  // Trabajador / Empleado
  const docNumber = getAttrFromXml(xml, "Trabajador", "NumeroDocumento") || rec.getString("employee_id") || "";
  const firstSurname = getAttrFromXml(xml, "Trabajador", "PrimerApellido") || "EMPLEADO";
  const secondSurname = getAttrFromXml(xml, "Trabajador", "SegundoApellido") || "";
  const firstName = getAttrFromXml(xml, "Trabajador", "PrimerNombre") || "EMPLEADO";
  const otherNames = getAttrFromXml(xml, "Trabajador", "OtrosNombres") || "";
  const typeWorker = parseInt(getAttrFromXml(xml, "Trabajador", "TipoTrabajador") || "1", 10);
  const subTypeWorker = parseInt(getAttrFromXml(xml, "Trabajador", "SubTipoTrabajador") || "0", 10);
  const typeContract = parseInt(getAttrFromXml(xml, "Trabajador", "TipoContrato") || "2", 10);
  const salary = parseFloat(getAttrFromXml(xml, "Trabajador", "Sueldo") || "0");

  const rawDocType = String(getAttrFromXml(xml, "Trabajador", "TipoDocumento") || "13").trim();
  const NOMINA_DIAN_TO_MATIAS_DOC_MAP = {
    "13": 1,  // Cédula de Ciudadanía
    "22": 2,  // Cédula de Extranjería
    "31": 3,  // NIT
    "11": 6,  // Registro Civil
    "12": 7,  // Tarjeta de Identidad
    "21": 8,  // Tarjeta de Extranjería
    "41": 9,  // Pasaporte
    "42": 10, // Doc. Extranjero
    "50": 11, // NIT de otro país
    "91": 12, // NUIP
    "48": 13, // PPT
    "47": 14  // PEP
  };
  let typeDocId = NOMINA_DIAN_TO_MATIAS_DOC_MAP[rawDocType] || 1; // Por defecto 1 (Cédula de Ciudadanía)

  const muniId = parseInt(getAttrFromXml(xml, "Trabajador", "LugarTrabajoMunicipioCiudad") || "76001", 10);
  const workerCode = getAttrFromXml(xml, "Trabajador", "CodigoTrabajador") || docNumber;
  const address = getAttrFromXml(xml, "Trabajador", "LugarTrabajoDireccion") || "CL 29 5 50";
  const highRisk = getAttrFromXml(xml, "Trabajador", "AltoRiesgoPension") === "true" ? "true" : "false";
  const integralSalary = getAttrFromXml(xml, "Trabajador", "SalarioIntegral") === "true" ? "true" : "false";

  // Información de Pago
  const bankName = getAttrFromXml(xml, "Pago", "Banco") || "Bancolombia";
  const accountType = getAttrFromXml(xml, "Pago", "TipoCuenta") || "Ahorros";
  const accountNumber = getAttrFromXml(xml, "Pago", "NumeroCuenta") || "0000000000";
  const paymentDates = [getTagValFromXml(xml, "FechaPago") || settlementEnd];

  // Devengos
  const workedDays = parseInt(getAttrFromXml(xml, "Basico", "DiasTrabajados") || timeWorked, 10);
  const salaryWorked = parseFloat(getAttrFromXml(xml, "Basico", "SueldoTrabajado") || String(salary));
  const auxTransporte = parseFloat(getAttrFromXml(xml, "Transporte", "AuxilioTransporte") || "0");

  const earn = {
    basic: {
      worked_days: workedDays,
      salary_worked: salaryWorked
    }
  };
  if (auxTransporte > 0) {
    earn.transportation = [{ transport_assistance: auxTransporte }];
  }

  // Deducciones
  const dedSaludVal = parseFloat(getAttrFromXml(xml, "Salud", "Deduccion") || "0");
  const dedSaludPct = getAttrFromXml(xml, "Salud", "Porcentaje") || "4.00";
  const dedPensionVal = parseFloat(getAttrFromXml(xml, "FondoPension", "Deduccion") || "0");
  const dedPensionPct = getAttrFromXml(xml, "FondoPension", "Porcentaje") || "4.00";

  const deductions = {
    health: { percentage: dedSaludPct, deduction: dedSaludVal },
    pension_fund: { percentage: dedPensionPct, deduction: dedPensionVal }
  };

  const totalEarned = rec.getFloat("total_devengos") || parseFloat(getTagValFromXml(xml, "DevengadosTotal") || String(salaryWorked + auxTransporte));
  const totalVoucher = rec.getFloat("total_neto") || parseFloat(getTagValFromXml(xml, "ComprobanteTotal") || String(totalEarned - (dedSaludVal + dedPensionVal)));

  const payload = {
    document_number: String(consecutivo),
    prefix: targetPrefix,
    resolution_number: resNumber,
    period: {
      date_entry: dateEntry,
      settlement_start_date: settlementStart,
      settlement_end_date: settlementEnd,
      time_worked: String(timeWorked)
    },
    general_information: {
      period_id: 5,
      type_xml_id: isReplace ? 103 : 102
    },
    employee: {
      document_number: docNumber,
      first_surname: firstSurname,
      second_surname: secondSurname,
      first_name: firstName,
      type_worker_id: typeWorker,
      sub_type_worker_id: subTypeWorker,
      type_contract_id: typeContract,
      salary: salary,
      type_document_identification_id: typeDocId,
      municipality_id: muniId,
      worker_code: workerCode,
      high_risk_pension: highRisk,
      integral_salary: integralSalary,
      work_address: address,
      address: address
    },
    payment: {
      payment_method_id: 1,
      bank_name: bankName,
      account_type: accountType,
      account_number: accountNumber
    },
    payment_dates: paymentDates,
    earn: earn,
    deductions: deductions,
    total_earned: totalEarned,
    total_voucher: totalVoucher
  };

  if (isReplace) {
    const reempMatch = xml.match(/<Reemplazar>([\s\S]*?)<\/Reemplazar>/i);
    const reempBlock = reempMatch ? reempMatch[1] : xml;

    const predNum = getAttrFromXml(xml, "NumeroSecuenciaXML", "Numero", reempBlock) ||
                   (getAttrFromXml(xml, "NumeroSecuenciaXML", "Prefijo", reempBlock) + getAttrFromXml(xml, "NumeroSecuenciaXML", "Consecutivo", reempBlock));
    const predCune = getTagValFromXml(xml, "CUNEPred", reempBlock);
    const predFecha = getTagValFromXml(xml, "FechaGenPred", reempBlock) || settlementStart;

    payload.replacing_predecessor = {
      number: predNum,
      cune: predCune,
      generation_date: predFecha
    };
  }

  return { endpoint: endpoint, payload: payload };
}

module.exports = {
  getAttrFromXml,
  getTagValFromXml,
  buildMatiasPayrollPayloadFromRec
};

