/**
 * PocketBase hooks para validaciones de integridad en Nómina (payroll_lines y payroll_novelties)
 */

/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  function normalizeDateStr(d) {
    if (!d) return "";
    const s = String(d).trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const parts = s.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return parts[0] + "-" + ("0" + parts[1]).slice(-2) + "-" + ("0" + parts[2]).slice(-2);
      } else if (parts[2].length === 4) {
        return parts[2] + "-" + ("0" + parts[1]).slice(-2) + "-" + ("0" + parts[0]).slice(-2);
      }
    }
    return s;
  }

  function getEmployeeContractRule(employeeId) {
    if (!employeeId) return null;
    try {
      // 1. Buscar en settings las partes particionadas (_part_001, _part_002, etc.)
      let records = [];
      try {
        records = $app.findRecordsByFilter(
          "settings",
          "key ~ 'payroll_accounting_config_v1_employee_rules_part_'",
          "+key",
          100,
          0
        );
      } catch (_) {}

      if (records && records.length > 0) {
        let merged = "";
        for (let i = 0; i < records.length; i++) {
          const r = records[i];
          if (!r) continue;
          const val = r.getString ? r.getString("value") : (r.get ? r.get("value") : "");
          merged += String(val || "");
        }
        if (merged) {
          try {
            const rules = JSON.parse(merged);
            if (Array.isArray(rules)) {
              for (let i = 0; i < rules.length; i++) {
                if (rules[i] && rules[i].employee_id === employeeId) {
                  return rules[i];
                }
              }
            }
          } catch (_) {}
        }
      }

      // 2. Buscar en settings la clave directa sin particionar
      try {
        const direct = $app.findFirstRecordByFilter(
          "settings",
          "key = 'payroll_accounting_config_v1_employee_rules'"
        );
        if (direct) {
          const val = direct.getString ? direct.getString("value") : (direct.get ? direct.get("value") : "");
          const rules = JSON.parse(val || "[]");
          if (Array.isArray(rules)) {
            for (let i = 0; i < rules.length; i++) {
              if (rules[i] && rules[i].employee_id === employeeId) {
                return rules[i];
              }
            }
          }
        }
      } catch (_) {}

      // 3. Buscar en la clave monolítica antigua
      try {
        const mono = $app.findFirstRecordByFilter(
          "settings",
          "key = 'payroll_accounting_config_v1'"
        );
        if (mono) {
          const val = mono.getString ? mono.getString("value") : (mono.get ? mono.get("value") : "");
          const parsed = JSON.parse(val || "{}");
          const rules = parsed.employee_rules;
          if (Array.isArray(rules)) {
            for (let i = 0; i < rules.length; i++) {
              if (rules[i] && rules[i].employee_id === employeeId) {
                return rules[i];
              }
            }
          }
        }
      } catch (_) {}
    } catch (err) {
      console.log("[PAYROLL-VALIDATIONS] Error leyendo employee_rules: " + err);
    }
    return null;
  }

  function validateEmployeeContractForPeriod(periodId, employeeId, employeeName) {
    if (!periodId || !employeeId) return;

    let period = null;
    try {
      period = $app.findRecordById("payroll_periods", periodId);
    } catch (_) {
      return;
    }
    if (!period) return;

    const dateFromVal = period.getString ? period.getString("date_from") : period.get("date_from");
    const dateToVal = period.getString ? period.getString("date_to") : period.get("date_to");
    const pFrom = normalizeDateStr(dateFromVal);
    const pTo = normalizeDateStr(dateToVal);
    if (!pFrom || !pTo) return;

    const rule = getEmployeeContractRule(employeeId);
    if (!rule) return;

    const cStart = normalizeDateStr(rule.start_date);
    const cEnd = normalizeDateStr(rule.end_date);
    const empLabel = employeeName || "especificado";

    if (cStart && cStart > pTo) {
      throw new BadRequestError(
        `El empleado ${empLabel} tiene fecha de inicio de contrato (${cStart}) posterior a la finalización del período (${pTo}). No puede recibir liquidaciones ni novedades en este período.`
      );
    }

    if (cEnd && cEnd < pFrom) {
      throw new BadRequestError(
        `El contrato del empleado ${empLabel} finalizó el ${cEnd}, fecha anterior al inicio del período (${pFrom}). No puede recibir liquidaciones ni novedades en este período.`
      );
    }
  }

  const employeeId = e.record.getString ? e.record.getString("employee_id") : e.record.get("employee_id");
  const periodId = e.record.getString ? e.record.getString("period_id") : e.record.get("period_id");
  let employeeName = "";

  // 1. Validar que el período exista y esté en estado Borrador (draft)
  if (periodId) {
    try {
      const period = $app.findRecordById("payroll_periods", periodId);
      const status = (period.getString ? period.getString("status") : period.get("status")) || "draft";
      if (status !== "draft") {
        throw new BadRequestError("No se pueden registrar liquidaciones ni novedades en un período que no esté en estado Borrador.");
      }
    } catch (err) {
      if (err instanceof BadRequestError || (err && err.status === 400)) throw err;
      throw new BadRequestError("El período de nómina especificado no existe.");
    }
  }

  // 2. Validar que el empleado exista y esté ACTIVO
  if (employeeId) {
    try {
      const employee = $app.findRecordById("third_parties", employeeId);
      employeeName = (employee.getString ? employee.getString("name") : employee.get("name")) || "";
      const isActive = employee.getBool ? employee.getBool("active") : employee.get("active");
      if (isActive === false) {
        throw new BadRequestError(`El empleado ${employeeName} está inactivo y no puede recibir liquidaciones ni novedades de nómina.`);
      }
    } catch (err) {
      if (err instanceof BadRequestError || (err && err.status === 400)) throw err;
      throw new BadRequestError("El empleado especificado no existe.");
    }
  }

  // 3. Validar vigencia de contrato según fechas del período
  if (periodId && employeeId) {
    validateEmployeeContractForPeriod(periodId, employeeId, employeeName);
  }

  // 4. Para payroll_lines: Validar unicidad (un solo registro por empleado por período)
  const colName = e.collection ? e.collection.name : (e.record.collection ? e.record.collection().name : "");
  if (colName === "payroll_lines" && periodId && employeeId) {
    try {
      const existing = $app.findFirstRecordByFilter(
        "payroll_lines",
        `period_id = '${periodId}' && employee_id = '${employeeId}'`
      );
      if (existing) {
        throw new BadRequestError("Ya existe una liquidación para este empleado en el período seleccionado. Edite la liquidación existente en lugar de crear una nueva.");
      }
    } catch (err) {
      if (err instanceof BadRequestError || (err && err.status === 400)) throw err;
    }
  }

  e.next();
}, "payroll_lines", "payroll_novelties");

onRecordUpdateRequest((e) => {
  function normalizeDateStr(d) {
    if (!d) return "";
    const s = String(d).trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const parts = s.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return parts[0] + "-" + ("0" + parts[1]).slice(-2) + "-" + ("0" + parts[2]).slice(-2);
      } else if (parts[2].length === 4) {
        return parts[2] + "-" + ("0" + parts[1]).slice(-2) + "-" + ("0" + parts[0]).slice(-2);
      }
    }
    return s;
  }

  function getEmployeeContractRule(employeeId) {
    if (!employeeId) return null;
    try {
      // 1. Buscar en settings las partes particionadas (_part_001, _part_002, etc.)
      let records = [];
      try {
        records = $app.findRecordsByFilter(
          "settings",
          "key ~ 'payroll_accounting_config_v1_employee_rules_part_'",
          "+key",
          100,
          0
        );
      } catch (_) {}

      if (records && records.length > 0) {
        let merged = "";
        for (let i = 0; i < records.length; i++) {
          const r = records[i];
          if (!r) continue;
          const val = r.getString ? r.getString("value") : (r.get ? r.get("value") : "");
          merged += String(val || "");
        }
        if (merged) {
          try {
            const rules = JSON.parse(merged);
            if (Array.isArray(rules)) {
              for (let i = 0; i < rules.length; i++) {
                if (rules[i] && rules[i].employee_id === employeeId) {
                  return rules[i];
                }
              }
            }
          } catch (_) {}
        }
      }

      // 2. Buscar en settings la clave directa sin particionar
      try {
        const direct = $app.findFirstRecordByFilter(
          "settings",
          "key = 'payroll_accounting_config_v1_employee_rules'"
        );
        if (direct) {
          const val = direct.getString ? direct.getString("value") : (direct.get ? direct.get("value") : "");
          const rules = JSON.parse(val || "[]");
          if (Array.isArray(rules)) {
            for (let i = 0; i < rules.length; i++) {
              if (rules[i] && rules[i].employee_id === employeeId) {
                return rules[i];
              }
            }
          }
        }
      } catch (_) {}

      // 3. Buscar en la clave monolítica antigua
      try {
        const mono = $app.findFirstRecordByFilter(
          "settings",
          "key = 'payroll_accounting_config_v1'"
        );
        if (mono) {
          const val = mono.getString ? mono.getString("value") : (mono.get ? mono.get("value") : "");
          const parsed = JSON.parse(val || "{}");
          const rules = parsed.employee_rules;
          if (Array.isArray(rules)) {
            for (let i = 0; i < rules.length; i++) {
              if (rules[i] && rules[i].employee_id === employeeId) {
                return rules[i];
              }
            }
          }
        }
      } catch (_) {}
    } catch (err) {
      console.log("[PAYROLL-VALIDATIONS] Error leyendo employee_rules: " + err);
    }
    return null;
  }

  function validateEmployeeContractForPeriod(periodId, employeeId, employeeName) {
    if (!periodId || !employeeId) return;

    let period = null;
    try {
      period = $app.findRecordById("payroll_periods", periodId);
    } catch (_) {
      return;
    }
    if (!period) return;

    const dateFromVal = period.getString ? period.getString("date_from") : period.get("date_from");
    const dateToVal = period.getString ? period.getString("date_to") : period.get("date_to");
    const pFrom = normalizeDateStr(dateFromVal);
    const pTo = normalizeDateStr(dateToVal);
    if (!pFrom || !pTo) return;

    const rule = getEmployeeContractRule(employeeId);
    if (!rule) return;

    const cStart = normalizeDateStr(rule.start_date);
    const cEnd = normalizeDateStr(rule.end_date);
    const empLabel = employeeName || "especificado";

    if (cStart && cStart > pTo) {
      throw new BadRequestError(
        `El empleado ${empLabel} tiene fecha de inicio de contrato (${cStart}) posterior a la finalización del período (${pTo}). No puede recibir liquidaciones ni novedades en este período.`
      );
    }

    if (cEnd && cEnd < pFrom) {
      throw new BadRequestError(
        `El contrato del empleado ${empLabel} finalizó el ${cEnd}, fecha anterior al inicio del período (${pFrom}). No puede recibir liquidaciones ni novedades en este período.`
      );
    }
  }

  const periodId = e.record.getString ? e.record.getString("period_id") : e.record.get("period_id");
  const employeeId = e.record.getString ? e.record.getString("employee_id") : e.record.get("employee_id");
  let employeeName = "";

  // 1. Validar que el período esté en borrador para permitir modificaciones
  if (periodId) {
    try {
      const period = $app.findRecordById("payroll_periods", periodId);
      const status = (period.getString ? period.getString("status") : period.get("status")) || "draft";
      if (status !== "draft") {
        throw new BadRequestError("No se pueden modificar liquidaciones ni novedades de un período en estado Aprobado o Pagado. Debe reversar el período primero.");
      }
    } catch (err) {
      if (err instanceof BadRequestError || (err && err.status === 400)) throw err;
    }
  }

  // 2. Validar que el empleado esté activo
  if (employeeId) {
    try {
      const employee = $app.findRecordById("third_parties", employeeId);
      employeeName = (employee.getString ? employee.getString("name") : employee.get("name")) || "";
      const isActive = employee.getBool ? employee.getBool("active") : employee.get("active");
      if (isActive === false) {
        throw new BadRequestError(`El empleado ${employeeName} está inactivo.`);
      }
    } catch (err) {
      if (err instanceof BadRequestError || (err && err.status === 400)) throw err;
    }
  }

  // 3. Validar vigencia de contrato según fechas del período
  if (periodId && employeeId) {
    validateEmployeeContractForPeriod(periodId, employeeId, employeeName);
  }

  e.next();
}, "payroll_lines", "payroll_novelties");
