/**
 * GRAVY ERP — Generador de Payloads JSON UBL 2.1 para MATIAS API (Nómina y Notas de Ajuste)
 * Archivo: pb_hooks/dian_nomina_matias_builder.js
 * Compatible con Goja Runtime via require(`${__hooks}/dian_nomina_matias_builder.js`)
 * Implementación completa de conceptos de devengados y deducciones según especificación MATIAS API.
 */

let resolveMatiasCityId = null;
try {
  const mc = require('./matias_cities.js');
  resolveMatiasCityId = mc.resolveMatiasCityId;
} catch (_) {
  resolveMatiasCityId = function(c, def) {
    const s = String(c || "").trim();
    if (s === "76520") return 1032;
    if (s === "76001") return 1006;
    if (s === "11001") return 149;
    const n = parseInt(s, 10);
    if (!isNaN(n) && n > 0 && n <= 1200 && s.length <= 4) return n;
    return def || 1006;
  };
}

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

function getAllTagMatches(xml, tag) {
  if (!xml) return [];
  const regex = new RegExp('<' + tag + '(?:\\s+([^>]*?))?(?:\\/>|>([\\s\\S]*?)<\\/' + tag + '>)', 'gi');
  const results = [];
  let m;
  while ((m = regex.exec(xml)) !== null) {
    results.push({ full: m[0], attrs: m[1] || '', inner: m[2] ? m[2].trim() : '' });
  }
  return results;
}

function extractAttrFromBlock(tagStr, attr) {
  if (!tagStr) return '';
  const am = tagStr.match(new RegExp(attr + '\\s*=\\s*"([^"]*)"', 'i'));
  return am ? am[1] : '';
}

function parseOtArray(xml, containerTag, itemTag, defaultPct) {
  const containerMatch = xml.match(new RegExp('<' + containerTag + '[^>]*>([\\s\\S]*?)<\\/' + containerTag + '>', 'i'));
  const searchBlock = containerMatch ? containerMatch[1] : xml;
  const items = getAllTagMatches(searchBlock, itemTag);
  if (!items.length) return null;

  const result = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const amount = extractAttrFromBlock(it.full, 'Cantidad') || '1';
    const pct = extractAttrFromBlock(it.full, 'Porcentaje') || defaultPct;
    const payment = parseFloat(extractAttrFromBlock(it.full, 'Pago') || '0').toFixed(2);
    const start = extractAttrFromBlock(it.full, 'HoraInicio') || null;
    const finalH = extractAttrFromBlock(it.full, 'HoraFin') || null;

    if (parseFloat(payment) > 0 || parseFloat(amount) > 0) {
      result.push({
        start_time: start,
        final_hour: finalH,
        amount: String(amount),
        percentage: String(pct),
        payment: payment
      });
    }
  }
  return result.length > 0 ? result : null;
}

function buildMatiasPayrollPayloadFromRec(rec, isAjusteDoc, prefijo, consecutivo) {
  const rawContent = (rec.getString("xml_generado") || "").trim();

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
  } catch (_) { }

  if (!targetPrefix) {
    targetPrefix = isAjusteDoc ? "NANE" : "NOM";
    rec.set("prefijo", targetPrefix);
  }

  // ─────────────────────────────────────────────────────────────
  // MODO NATIVO JSON: Si el comprobante almacena un JSON estructurado
  // ─────────────────────────────────────────────────────────────
  if (rawContent.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawContent);

      parsed.document_number = String(consecutivo || rec.getInt("consecutivo") || parsed.document_number || 1);
      parsed.prefix = targetPrefix || parsed.prefix || "NOM";
      parsed.resolution_number = parsed.resolution_number || resNumber || "18760000001";

      // Validar / actualizar fecha de ingreso real de contrato desde settings si aplica
      const empId = rec.getString("employee_id");
      if (empId && parsed.period) {
        try {
          const parts = $app.findRecordsByFilter("settings", "key ~ 'payroll_accounting_config_v1_employee_rules'");
          if (parts && parts.length > 0) {
            parts.sort(function (a, b) { return a.getString("key").localeCompare(b.getString("key")); });
            let allRulesJson = "";
            parts.forEach(function (p) { allRulesJson += (p.getString("value") || ""); });
            const parsedRules = JSON.parse(allRulesJson);
            const found = parsedRules.find(function (r) { return r.employee_id === empId; });
            if (found) {
              if (found.start_date) {
                parsed.period.date_entry = found.start_date;
              }
              if (found.end_date && !parsed.period.departure_date) {
                parsed.period.departure_date = found.end_date;
              }
            }
          }
        } catch (_) { }
      }

      // Determinar endpoint según tipo de documento / payload
      let endpoint = "/api/ubl2.1/ep/payroll";
      if (parsed.payroll_type === "delete" || parsed.deleting_predecessor) {
        endpoint = "/api/ubl2.1/ep/payroll/delete";
      } else if (parsed.payroll_type === "replace" || parsed.relevant_predecessor || parsed.replacing_predecessor || isAjusteDoc) {
        endpoint = "/api/ubl2.1/ep/payroll/replace";
      }

      // Normalizar estructura obligatoria para MATIAS API si no es eliminación
      if (endpoint !== "/api/ubl2.1/ep/payroll/delete") {
        if (!parsed.general_information) {
          parsed.general_information = {
            generation_date: parsed.period?.generation_date || parsed.period?.date_issue || parsed.period?.settlement_end_date || new Date().toISOString().slice(0, 10),
            generation_time: "10:00:00",
            period_id: parsed.payroll_period_id || 5,
            currency_id: 272,
            trm: "0",
            type_xml_id: (endpoint === "/api/ubl2.1/ep/payroll/replace") ? 103 : 102
          };
        }

        const rawGenCity = parsed.generation_city_id || parsed.employee?.municipality_id || parsed.worker?.municipality_id || "76001";
        const resolvedGenCity = resolveMatiasCityId(rawGenCity, 1006);
        parsed.generation_city_id = String(resolvedGenCity);

        if (!parsed.employee) {
          const w = parsed.worker || {};
          const firstSur = w.first_surname || w.surname || "EMPLEADO";
          const rawMuni = w.municipality_id || w.work_city_id || rawGenCity;
          const resolvedMuni = resolveMatiasCityId(rawMuni, resolvedGenCity);
          let wSub = parseInt(w.worker_subtype_id || w.sub_type_worker_id || 1, 10);
          if (!wSub || wSub === 0) wSub = 1;
          let wType = parseInt(w.worker_type_id || w.type_worker_id || 1, 10);
          if (!wType || wType === 0) wType = 1;

          parsed.employee = {
            worker_type_id: wType,
            worker_subtype_id: wSub,
            contract_type_id: parseInt(w.contract_type_id || w.type_contract_id || 2, 10) || 2,
            identity_document_id: String(w.identity_document_id || w.type_document_id || 1),
            document_number: String(w.document_number || w.worker_code || ""),
            first_surname: firstSur,
            second_surname: w.second_surname || "",
            first_name: w.first_name || "COLABORADOR",
            other_names: w.other_names || "",
            working_country_id: 45,
            work_city_id: resolvedMuni,
            work_address: w.work_address || w.address || "",
            high_risk_pension: String(w.high_risk_pension || "false"),
            integral_salary: String(w.integral_salary || "false"),
            salary: String(w.salary || "0.00"),
            worker_code: String(w.worker_code || w.document_number || "")
          };
        } else {
          const rawEmpMuni = parsed.employee.municipality_id || parsed.employee.work_city_id || rawGenCity;
          const resolvedEmpMuni = resolveMatiasCityId(rawEmpMuni, resolvedGenCity);
          parsed.employee.work_city_id = resolvedEmpMuni;

          let empSub = parseInt(parsed.employee.worker_subtype_id || parsed.employee.sub_type_worker_id || 1, 10);
          if (!empSub || empSub === 0) empSub = 1;
          parsed.employee.worker_subtype_id = empSub;

          let empType = parseInt(parsed.employee.worker_type_id || parsed.employee.type_worker_id || 1, 10);
          if (!empType || empType === 0) empType = 1;
          parsed.employee.worker_type_id = empType;
        }

        if (parsed.worker) {
          parsed.worker.municipality_id = resolveMatiasCityId(parsed.worker.municipality_id || rawGenCity, resolvedGenCity);
        }

        if (!parsed.earn && parsed.accrued) {
          parsed.earn = parsed.accrued;
        }

        if (parsed.earn && Array.isArray(parsed.earn.other_concepts)) {
          parsed.earn.other_concepts.forEach(function(oc) {
            if (!oc.conceptS && oc.salary_concept) oc.conceptS = oc.salary_concept;
            if (!oc.conceptNS && oc.non_salary_concept) oc.conceptNS = oc.non_salary_concept;
            if (!oc.description && oc.concept_description) oc.description = oc.concept_description;
          });
        }

        if (parsed.deductions) {
          if (!parsed.deductions.health && parsed.deductions.eps_type) {
            parsed.deductions.health = parsed.deductions.eps_type;
          }
          if (!parsed.deductions.pension_fund && parsed.deductions.pension_type) {
            parsed.deductions.pension_fund = parsed.deductions.pension_type;
          }
          if (!parsed.deductions.fundSP && parsed.deductions.deduction_sp) {
            parsed.deductions.fundSP = {
              percentage: parsed.deductions.deduction_sp.percentage || "1.00",
              deduction: parsed.deductions.deduction_sp.deduction_sp || parsed.deductions.deduction_sp.deduction || "0.00",
              percentageSub: "0.00",
              deductionSub: "0.00"
            };
          }
          if (!parsed.deductions.retefuente && parsed.deductions.withholding_at_source) {
            parsed.deductions.retefuente = parsed.deductions.withholding_at_source;
          }
        }

        if (parsed.payment) {
          if (!parsed.payment.means_payment_id) {
            parsed.payment.means_payment_id = parsed.payment.payment_method_id === 1 ? "30" : "10";
          }
          if (!parsed.payment.bank && parsed.payment.bank_name) {
            parsed.payment.bank = parsed.payment.bank_name;
          }
          if (!parsed.payment.bank_name && parsed.payment.bank) {
            parsed.payment.bank_name = parsed.payment.bank;
          }
        }

        if (!parsed.total_earned) {
          parsed.total_earned = parsed.accrued_total || (rec.getFloat ? rec.getFloat("total_devengos").toFixed(2) : "0.00");
        }
        if (!parsed.total_voucher) {
          parsed.total_voucher = parsed.payroll_total || (rec.getFloat ? rec.getFloat("total_neto").toFixed(2) : "0.00");
        }
        if (!parsed.deductions_total) {
          parsed.deductions_total = parsed.total_deductions || (rec.getFloat ? rec.getFloat("total_deducciones").toFixed(2) : "0.00");
        }
        if (!parsed.worker_code) {
          parsed.worker_code = String(parsed.employee?.worker_code || parsed.worker?.worker_code || parsed.employee?.document_number || "");
        }
        if (parsed.novelty === undefined) {
          parsed.novelty = false;
        }
        if (!parsed.pay_day) {
          parsed.pay_day = (parsed.payment_dates && parsed.payment_dates[0]) || parsed.period?.settlement_end_date || new Date().toISOString().slice(0, 10);
        }
        if (parsed.notes === undefined) {
          parsed.notes = "";
        }
        if (!parsed.rounding) {
          parsed.rounding = "0.00";
        }

        if (endpoint === "/api/ubl2.1/ep/payroll/replace") {
          if (!parsed.replacing_predecessor && parsed.relevant_predecessor) {
            parsed.replacing_predecessor = parsed.relevant_predecessor;
          }
        }

        // Limpieza de campos legacy y alias para emitir un JSON canónico 100% puro MATIAS API
        delete parsed.worker;
        delete parsed.accrued;
        delete parsed.accrued_total;
        delete parsed.payroll_total;
        delete parsed.total_deductions;

        if (parsed.employee) {
          delete parsed.employee.type_worker_id;
          delete parsed.employee.sub_type_worker_id;
          delete parsed.employee.type_contract_id;
          delete parsed.employee.type_document_identification_id;
          delete parsed.employee.type_document_id;
          delete parsed.employee.municipality_id;
          delete parsed.employee.address;
        }

        if (parsed.payment) {
          delete parsed.payment.bank_name;
        }

        if (parsed.earn && Array.isArray(parsed.earn.other_concepts)) {
          parsed.earn.other_concepts.forEach(function(oc) {
            delete oc.salary_concept;
            delete oc.non_salary_concept;
            delete oc.concept_description;
          });
        }

        if (parsed.deductions) {
          delete parsed.deductions.eps_type;
          delete parsed.deductions.pension_type;
          delete parsed.deductions.deduction_sp;
          delete parsed.deductions.withholding_at_source;
        }
      }

      return { endpoint: endpoint, payload: parsed };
    } catch (parseErr) {
      console.error("[MATIAS NOMINA BUILDER] Error al parsear JSON nativo de nómina:", parseErr);
      // Fallback a parser XML en caso de fallo
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MODO FALLBACK (LEGACY XML): Para comprobantes históricos Facturatech
  // ─────────────────────────────────────────────────────────────
  const xml = rawContent;
  const tipoNota = getTagValFromXml(xml, "TipoNota");

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
  let dateEntry = getAttrFromXml(xml, "Periodo", "FechaIngreso");
  const empId = rec.getString("employee_id");
  if (empId) {
    try {
      const parts = $app.findRecordsByFilter("settings", "key ~ 'payroll_accounting_config_v1_employee_rules'");
      if (parts && parts.length > 0) {
        parts.sort(function (a, b) { return a.getString("key").localeCompare(b.getString("key")); });
        let allRulesJson = "";
        parts.forEach((p) => { allRulesJson += (p.getString("value") || ""); });
        const parsedRules = JSON.parse(allRulesJson);
        const found = parsedRules.find((r) => r.employee_id === empId);
        if (found && found.start_date) {
          dateEntry = found.start_date;
        }
      }
    } catch (_) { }
  }
  if (!dateEntry) dateEntry = "2026-01-01";
  const departureDate = getAttrFromXml(xml, "Periodo", "FechaRetiro") || null;
  const settlementStart = getAttrFromXml(xml, "Periodo", "FechaLiquidacionInicio") || (rec.getInt("ano") + "-" + String(rec.getInt("mes")).padStart(2, '0') + "-01");
  const settlementEnd = getAttrFromXml(xml, "Periodo", "FechaLiquidacionFin") || (rec.getInt("ano") + "-" + String(rec.getInt("mes")).padStart(2, '0') + "-30");
  const timeWorked = getAttrFromXml(xml, "Periodo", "TiempoLaborado") || "30";

  // Trabajador / Empleado
  const docNumber = getAttrFromXml(xml, "Trabajador", "NumeroDocumento") || rec.getString("employee_id") || "";
  const firstSurname = getAttrFromXml(xml, "Trabajador", "PrimerApellido") || "EMPLEADO";
  const secondSurname = getAttrFromXml(xml, "Trabajador", "SegundoApellido") || "";
  const firstName = getAttrFromXml(xml, "Trabajador", "PrimerNombre") || "EMPLEADO";
  const otherNames = getAttrFromXml(xml, "Trabajador", "OtrosNombres") || "";
  let typeWorker = parseInt(getAttrFromXml(xml, "Trabajador", "TipoTrabajador") || "1", 10) || 1;
  let subTypeWorker = parseInt(getAttrFromXml(xml, "Trabajador", "SubTipoTrabajador") || "1", 10) || 1;
  if (subTypeWorker === 0) subTypeWorker = 1;
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
  let typeDocId = NOMINA_DIAN_TO_MATIAS_DOC_MAP[rawDocType] || 1;

  const rawMuni = getAttrFromXml(xml, "Trabajador", "LugarTrabajoMunicipioCiudad") || "76001";
  const muniId = resolveMatiasCityId(rawMuni, 1006);
  const workerCode = getAttrFromXml(xml, "Trabajador", "CodigoTrabajador") || docNumber;
  const address = getAttrFromXml(xml, "Trabajador", "LugarTrabajoDireccion") || "CL 29 5 50";
  const highRisk = getAttrFromXml(xml, "Trabajador", "AltoRiesgoPension") === "true" ? "true" : "false";
  const integralSalary = getAttrFromXml(xml, "Trabajador", "SalarioIntegral") === "true" ? "true" : "false";

  // Información de Pago
  const bankName = getAttrFromXml(xml, "Pago", "Banco") || "Bancolombia";
  const accountType = getAttrFromXml(xml, "Pago", "TipoCuenta") || "Ahorros";
  const accountNumber = getAttrFromXml(xml, "Pago", "NumeroCuenta") || "0000000000";
  const paymentDates = [getTagValFromXml(xml, "FechaPago") || settlementEnd];

  // ─────────────────────────────────────────────────────────────
  // 1. DEVENGADOS (earn)
  // ─────────────────────────────────────────────────────────────
  const workedDays = parseInt(getAttrFromXml(xml, "Basico", "DiasTrabajados") || timeWorked, 10);
  const salaryWorked = parseFloat(getAttrFromXml(xml, "Basico", "SueldoTrabajado") || String(salary));

  const earn = {
    basic: {
      worked_days: String(workedDays),
      salary_worked: salaryWorked.toFixed(2)
    }
  };

  // Transporte (objeto oficial MATIAS API: transportation_assistance, viatic_maintenance, viatic_non_salary_maintenance)
  const auxTransporte = parseFloat(getAttrFromXml(xml, "Transporte", "AuxilioTransporte") || "0");
  const viaticoSal = parseFloat(getAttrFromXml(xml, "Transporte", "ViaticoManuAlojS") || "0");
  const viaticoNonSal = parseFloat(getAttrFromXml(xml, "Transporte", "ViaticoManuAlojNS") || "0");
  if (auxTransporte > 0 || viaticoSal > 0 || viaticoNonSal > 0) {
    earn.transport = {
      transportation_assistance: auxTransporte.toFixed(2),
      viatic_maintenance: viaticoSal.toFixed(2),
      viatic_non_salary_maintenance: viaticoNonSal.toFixed(2)
    };
  }

  // Horas Extras y Recargos
  const heds = parseOtArray(xml, 'HEDs', 'HED', '25.00');
  if (heds) earn.HEDs = heds;

  const hens = parseOtArray(xml, 'HENs', 'HEN', '75.00');
  if (hens) earn.HENs = hens;

  const hrns = parseOtArray(xml, 'HRNs', 'HRN', '35.00');
  if (hrns) earn.HRNs = hrns;

  const heddfs = parseOtArray(xml, 'HEDDFs', 'HEDDF', '100.00');
  if (heddfs) earn.HEDDFs = heddfs;

  const hrddfs = parseOtArray(xml, 'HRDDFs', 'HRDDF', '75.00');
  if (hrddfs) earn.HRDDFs = hrddfs;

  const hendfs = parseOtArray(xml, 'HENDFs', 'HENDF', '150.00');
  if (hendfs) earn.HENDFs = hendfs;

  const hrndfs = parseOtArray(xml, 'HRNDFs', 'HRNDF', '110.00');
  if (hrndfs) earn.HRNDFs = hrndfs;

  // Vacaciones (comunes y pagadas/compensadas)
  const vacComunesMatch = xml.match(/<VacacionesComunes\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/VacacionesComunes>)/i);
  const vacCompMatch = xml.match(/<VacacionesCompensadas\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/VacacionesCompensadas>)/i);
  if (vacComunesMatch || vacCompMatch) {
    earn.vacations = {};
    if (vacComunesMatch) {
      const b = vacComunesMatch[0];
      earn.vacations.common = {
        start_date: extractAttrFromBlock(b, 'FechaInicio') || settlementStart,
        final_date: extractAttrFromBlock(b, 'FechaFin') || settlementEnd,
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1'),
        payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2)
      };
    }
    if (vacCompMatch) {
      const b = vacCompMatch[0];
      earn.vacations.paid = {
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1'),
        payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2)
      };
    }
  }

  // Primas
  const primasMatch = xml.match(/<Primas\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/Primas>)/i);
  if (primasMatch) {
    const b = primasMatch[0];
    earn.bonus = {
      amount: String(extractAttrFromBlock(b, 'Cantidad') || '180'),
      payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2),
      non_salary_payment: parseFloat(extractAttrFromBlock(b, 'PagoNS') || '0').toFixed(2)
    };
  }

  // Cesantías e Intereses
  const cesantiasMatch = xml.match(/<Cesantias\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/Cesantias>)/i);
  if (cesantiasMatch) {
    const b = cesantiasMatch[0];
    earn.cesantias = {
      payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2),
      percentage: extractAttrFromBlock(b, 'Porcentaje') || '12.00',
      interest_payment: parseFloat(extractAttrFromBlock(b, 'PagoIntereses') || '0').toFixed(2)
    };
  }

  // Incapacidades
  const incaps = getAllTagMatches(xml, 'Incapacidad');
  if (incaps.length) {
    earn.incapacity = [];
    for (let i = 0; i < incaps.length; i++) {
      const b = incaps[i].full;
      earn.incapacity.push({
        start_date: extractAttrFromBlock(b, 'FechaInicio') || settlementStart,
        final_date: extractAttrFromBlock(b, 'FechaFin') || settlementEnd,
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1'),
        type_id: parseInt(extractAttrFromBlock(b, 'Tipo') || '1', 10),
        payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2)
      });
    }
  }

  // Licencias (maternidad/paternidad, remunerada, no remunerada)
  const licMPMatch = xml.match(/<LicenciaMP\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/LicenciaMP>)/i);
  const licRMatch = xml.match(/<LicenciaR\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/LicenciaR>)/i);
  const licNRMatch = xml.match(/<LicenciaNR\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/LicenciaNR>)/i);
  if (licMPMatch || licRMatch || licNRMatch) {
    earn.licenses = {};
    if (licMPMatch) {
      const b = licMPMatch[0];
      earn.licenses.licenseMP = {
        start_date: extractAttrFromBlock(b, 'FechaInicio') || settlementStart,
        final_date: extractAttrFromBlock(b, 'FechaFin') || settlementEnd,
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1'),
        payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2)
      };
    }
    if (licRMatch) {
      const b = licRMatch[0];
      earn.licenses.licenseR = {
        start_date: extractAttrFromBlock(b, 'FechaInicio') || settlementStart,
        final_date: extractAttrFromBlock(b, 'FechaFin') || settlementEnd,
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1'),
        payment: parseFloat(extractAttrFromBlock(b, 'Pago') || '0').toFixed(2)
      };
    }
    if (licNRMatch) {
      const b = licNRMatch[0];
      earn.licenses.licenseNR = {
        start_date: extractAttrFromBlock(b, 'FechaInicio') || settlementStart,
        final_date: extractAttrFromBlock(b, 'FechaFin') || settlementEnd,
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1')
      };
    }
  }

  // Bonificaciones (salariales y no salariales)
  const bonifs = getAllTagMatches(xml, 'Bonificacion');
  if (bonifs.length) {
    earn.bonuses = [];
    for (let i = 0; i < bonifs.length; i++) {
      const b = bonifs[i].full;
      const bS = parseFloat(extractAttrFromBlock(b, 'BonificacionS') || '0').toFixed(2);
      const bNS = parseFloat(extractAttrFromBlock(b, 'BonificacionNS') || '0').toFixed(2);
      earn.bonuses.push({ bonusS: bS, bonusNS: bNS });
    }
  }

  // Auxilios (salariales y no salariales)
  const auxs = getAllTagMatches(xml, 'Auxilio');
  if (auxs.length) {
    earn.assistances = [];
    for (let i = 0; i < auxs.length; i++) {
      const b = auxs[i].full;
      const aS = parseFloat(extractAttrFromBlock(b, 'AuxilioS') || '0').toFixed(2);
      const aNS = parseFloat(extractAttrFromBlock(b, 'AuxilioNS') || '0').toFixed(2);
      earn.assistances.push({ assistanceS: aS, assistanceNS: aNS });
    }
  }

  // Comisiones
  const coms = getAllTagMatches(xml, 'Comision');
  if (coms.length) {
    earn.commissions = [];
    for (let i = 0; i < coms.length; i++) {
      const cVal = parseFloat(coms[i].inner || extractAttrFromBlock(coms[i].full, 'Pago') || '0').toFixed(2);
      earn.commissions.push({ commission: cVal });
    }
  }

  // Dotación
  const dotVal = parseFloat(getTagValFromXml(xml, 'Dotacion') || '0');
  if (dotVal > 0) earn.endowment = dotVal.toFixed(2);

  // Otros Conceptos
  const ocs = getAllTagMatches(xml, 'OtroConcepto');
  if (ocs.length) {
    earn.other_concepts = [];
    for (let i = 0; i < ocs.length; i++) {
      const b = ocs[i].full;
      earn.other_concepts.push({
        description: extractAttrFromBlock(b, 'DescripcionConcepto') || 'Otros Conceptos',
        conceptS: parseFloat(extractAttrFromBlock(b, 'ConceptoS') || '0').toFixed(2),
        conceptNS: parseFloat(extractAttrFromBlock(b, 'ConceptoNS') || '0').toFixed(2)
      });
    }
  }

  // Huelgas Legales
  const strikes = getAllTagMatches(xml, 'HuelgaLegal');
  if (strikes.length) {
    earn.legal_strikes = [];
    for (let i = 0; i < strikes.length; i++) {
      const b = strikes[i].full;
      earn.legal_strikes.push({
        start_date: extractAttrFromBlock(b, 'FechaInicio') || settlementStart,
        final_date: extractAttrFromBlock(b, 'FechaFin') || settlementEnd,
        amount: String(extractAttrFromBlock(b, 'Cantidad') || '1')
      });
    }
  }

  // Compensaciones (CTA / Cooperativas)
  const comps = getAllTagMatches(xml, 'Compensacion');
  if (comps.length) {
    earn.compensations = [];
    for (let i = 0; i < comps.length; i++) {
      const b = comps[i].full;
      earn.compensations.push({
        compensationO: parseFloat(extractAttrFromBlock(b, 'CompensacionO') || '0').toFixed(2),
        compensationE: parseFloat(extractAttrFromBlock(b, 'CompensacionE') || '0').toFixed(2)
      });
    }
  }

  // Pagos a Terceros como Devengo
  const devXmlMatch = xml.match(/<Devengados[^>]*>([\s\S]*?)<\/Devengados>/i);
  const devXml = devXmlMatch ? devXmlMatch[1] : xml;
  const devPagosTerceros = getAllTagMatches(devXml, 'PagoTercero').concat(getAllTagMatches(devXml, 'PagoTerceroDev'));
  if (devPagosTerceros.length) {
    earn.payments_third_party = [];
    for (let i = 0; i < devPagosTerceros.length; i++) {
      const ptVal = parseFloat(devPagosTerceros[i].inner || extractAttrFromBlock(devPagosTerceros[i].full, 'Pago') || '0');
      if (ptVal > 0) earn.payments_third_party.push({ payment_third_party: ptVal.toFixed(2) });
    }
  }

  // Bonificación de Retiro
  const withVal = parseFloat(getTagValFromXml(xml, 'BonifRetiro') || '0');
  if (withVal > 0) earn.withdrawal_bonus = withVal.toFixed(2);

  // Teletrabajo, Apoyo Sostenimiento, Indemnización, Reembolso
  const teleVal = parseFloat(getTagValFromXml(xml, 'Teletrabajo') || '0');
  if (teleVal > 0) earn.teleworking = teleVal.toFixed(2);

  const sustVal = parseFloat(getTagValFromXml(xml, 'ApoyoSost') || getTagValFromXml(xml, 'ApoyoSostenimiento') || '0');
  if (sustVal > 0) earn.sustaining_support = sustVal.toFixed(2);

  const indemVal = parseFloat(getTagValFromXml(xml, 'Indemnizacion') || '0');
  if (indemVal > 0) earn.indemnification = indemVal.toFixed(2);

  const refDevVal = parseFloat(getTagValFromXml(devXml, 'Reintegro') || getTagValFromXml(devXml, 'ReintegroDevengo') || '0');
  if (refDevVal > 0) earn.refund = refDevVal.toFixed(2);

  // ─────────────────────────────────────────────────────────────
  // 2. DEDUCCIONES (deductions)
  // ─────────────────────────────────────────────────────────────
  const dedMatch = xml.match(/<Deducciones[^>]*>([\s\S]*?)<\/Deducciones>/i);
  const dedXml = dedMatch ? dedMatch[1] : xml;

  const dedSaludVal = parseFloat(getAttrFromXml(dedXml, "Salud", "Deduccion") || "0");
  const dedSaludPct = getAttrFromXml(dedXml, "Salud", "Porcentaje") || "4.00";
  const dedPensionVal = parseFloat(getAttrFromXml(dedXml, "FondoPension", "Deduccion") || "0");
  const dedPensionPct = getAttrFromXml(dedXml, "FondoPension", "Porcentaje") || "4.00";

  const deductions = {
    health: { percentage: dedSaludPct, deduction: dedSaludVal.toFixed(2) },
    pension_fund: { percentage: dedPensionPct, deduction: dedPensionVal.toFixed(2) }
  };

  // Fondo de Solidaridad Pensional (fundSP)
  const fspMatch = dedXml.match(/<FondoSP\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/FondoSP>)/i);
  if (fspMatch) {
    const b = fspMatch[0];
    const spVal = parseFloat(extractAttrFromBlock(b, 'DeduccionSP') || '0');
    const subVal = parseFloat(extractAttrFromBlock(b, 'DeduccionSub') || '0');
    if (spVal > 0 || subVal > 0) {
      deductions.fundSP = {
        percentage: extractAttrFromBlock(b, 'Porcentaje') || '1.00',
        deduction: spVal.toFixed(2),
        percentageSub: extractAttrFromBlock(b, 'PorcentajeSub') || '0.00',
        deductionSub: subVal.toFixed(2)
      };
    }
  }

  // Sindicatos
  const sindicatos = getAllTagMatches(dedXml, 'Sindicato');
  if (sindicatos.length) {
    deductions.trade_union = [];
    for (let i = 0; i < sindicatos.length; i++) {
      const b = sindicatos[i].full;
      const sVal = parseFloat(extractAttrFromBlock(b, 'Deduccion') || '0');
      if (sVal > 0) {
        deductions.trade_union.push({
          percentage: extractAttrFromBlock(b, 'Porcentaje') || '1.00',
          deduction: sVal.toFixed(2)
        });
      }
    }
  }

  // Sanciones (Multas disciplinarias)
  const sanciones = getAllTagMatches(dedXml, 'Sancion');
  if (sanciones.length) {
    deductions.sanctions = [];
    for (let i = 0; i < sanciones.length; i++) {
      const b = sanciones[i].full;
      deductions.sanctions.push({
        sanctionPublic: parseFloat(extractAttrFromBlock(b, 'SancionPublic') || '0').toFixed(2),
        sanctionPriv: parseFloat(extractAttrFromBlock(b, 'SancionPriv') || '0').toFixed(2)
      });
    }
  }

  // Libranzas
  const libranzas = getAllTagMatches(dedXml, 'Libranza');
  if (libranzas.length) {
    deductions.libranzas = [];
    for (let i = 0; i < libranzas.length; i++) {
      const b = libranzas[i].full;
      const lVal = parseFloat(extractAttrFromBlock(b, 'Deduccion') || '0');
      if (lVal > 0) {
        deductions.libranzas.push({
          description: extractAttrFromBlock(b, 'Descripcion') || 'Deducción Libranza',
          deduction: lVal.toFixed(2)
        });
      }
    }
  }

  // Anticipos descontados
  const ants = getAllTagMatches(dedXml, 'Anticipo');
  if (ants.length) {
    deductions.advances = [];
    for (let i = 0; i < ants.length; i++) {
      const aVal = parseFloat(ants[i].inner || extractAttrFromBlock(ants[i].full, 'Pago') || '0');
      if (aVal > 0) deductions.advances.push({ advance: aVal.toFixed(2) });
    }
  }

  // Otras deducciones
  const otrasDeds = getAllTagMatches(dedXml, 'OtraDeduccion');
  if (otrasDeds.length) {
    deductions.other_deductions = [];
    for (let i = 0; i < otrasDeds.length; i++) {
      const odVal = parseFloat(otrasDeds[i].inner || extractAttrFromBlock(otrasDeds[i].full, 'Deduccion') || '0');
      if (odVal > 0) deductions.other_deductions.push({ other_deduction: odVal.toFixed(2) });
    }
  }

  // Pagos a Terceros (Deducción)
  const pagosTerceros = getAllTagMatches(dedXml, 'PagoTercero');
  if (pagosTerceros.length) {
    deductions.third_party_payment = [];
    for (let i = 0; i < pagosTerceros.length; i++) {
      const ptVal = parseFloat(pagosTerceros[i].inner || extractAttrFromBlock(pagosTerceros[i].full, 'Pago') || '0');
      if (ptVal > 0) deductions.third_party_payment.push({ third_party_pay: ptVal.toFixed(2) });
    }
  }

  // Retención en la fuente
  const reteVal = parseFloat(getTagValFromXml(dedXml, 'RetencionFuente') || '0');
  if (reteVal > 0) deductions.retefuente = reteVal.toFixed(2);

  // Embargo Fiscal
  const embVal = parseFloat(getTagValFromXml(dedXml, 'EmbargoFiscal') || '0');
  if (embVal > 0) deductions.tax_embargo = embVal.toFixed(2);

  // Deuda con la empresa
  const deudaVal = parseFloat(getTagValFromXml(dedXml, 'Deuda') || '0');
  if (deudaVal > 0) deductions.debt = deudaVal.toFixed(2);

  // Pensión Voluntaria
  const penVolVal = parseFloat(getTagValFromXml(dedXml, 'PensionVoluntaria') || '0');
  if (penVolVal > 0) deductions.voluntary_pension = penVolVal.toFixed(2);

  // Ahorro AFC
  const afcVal = parseFloat(getTagValFromXml(dedXml, 'AFC') || '0');
  if (afcVal > 0) deductions.afc = afcVal.toFixed(2);

  // Cooperativas
  const coopVal = parseFloat(getTagValFromXml(dedXml, 'Cooperativa') || '0');
  if (coopVal > 0) deductions.cooperative = coopVal.toFixed(2);

  // Plan Complementario
  const planVal = parseFloat(getTagValFromXml(dedXml, 'PlanComplementarios') || getTagValFromXml(dedXml, 'PlanComplementario') || '0');
  if (planVal > 0) deductions.complementary_plan = planVal.toFixed(2);

  // Educación
  const eduVal = parseFloat(getTagValFromXml(dedXml, 'Educacion') || '0');
  if (eduVal > 0) deductions.education = eduVal.toFixed(2);

  // Reintegro Deducción
  const reinDedVal = parseFloat(getTagValFromXml(dedXml, 'Reintegro') || getTagValFromXml(dedXml, 'ReintegroDeduccion') || '0');
  if (reinDedVal > 0) deductions.refund = reinDedVal.toFixed(2);

  // ─────────────────────────────────────────────────────────────
  // 3. TOTALES
  // ─────────────────────────────────────────────────────────────
  const totalEarned = rec.getFloat("total_devengos") || parseFloat(getTagValFromXml(xml, "DevengadosTotal") || String(salaryWorked + auxTransporte));
  const totalDeductions = rec.getFloat("total_deducciones") || parseFloat(getTagValFromXml(xml, "DeduccionesTotal") || String(dedSaludVal + dedPensionVal));
  const totalVoucher = rec.getFloat("total_neto") || parseFloat(getTagValFromXml(xml, "ComprobanteTotal") || String(totalEarned - totalDeductions));

  const payload = {
    document_number: String(consecutivo),
    prefix: targetPrefix,
    resolution_number: resNumber,
    generation_city_id: String(muniId),
    worker_code: workerCode,
    novelty: false,
    pay_day: paymentDates[0] || settlementEnd,
    notes: "",
    period: {
      date_entry: dateEntry,
      departure_date: departureDate,
      settlement_start_date: settlementStart,
      settlement_end_date: settlementEnd,
      time_worked: String(timeWorked),
      generation_date: settlementEnd
    },
    general_information: {
      generation_date: settlementEnd,
      generation_time: "10:00:00",
      period_id: 5,
      currency_id: 272,
      trm: "0",
      type_xml_id: isReplace ? 103 : 102
    },
    employee: {
      worker_type_id: typeWorker,
      worker_subtype_id: subTypeWorker,
      contract_type_id: typeContract,
      identity_document_id: String(typeDocId),
      document_number: docNumber,
      first_surname: firstSurname,
      second_surname: secondSurname,
      first_name: firstName,
      other_names: otherNames,
      working_country_id: 45,
      work_city_id: muniId,
      work_address: address,
      high_risk_pension: highRisk,
      integral_salary: integralSalary,
      salary: salary.toFixed(2),
      worker_code: workerCode
    },
    payment: {
      payment_method_id: 1,
      means_payment_id: "30",
      bank: bankName,
      account_type: accountType,
      account_number: accountNumber
    },
    payment_dates: paymentDates,
    earn: earn,
    deductions: deductions,
    rounding: "0.00",
    total_earned: totalEarned.toFixed(2),
    deductions_total: totalDeductions.toFixed(2),
    total_voucher: totalVoucher.toFixed(2)
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
  getAllTagMatches,
  extractAttrFromBlock,
  buildMatiasPayrollPayloadFromRec
};
