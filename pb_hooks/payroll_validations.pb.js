/**
 * PocketBase hooks para validaciones de integridad en Nómina (payroll_lines y payroll_novelties)
 */

/// <reference path="../pb_data/types.d.ts" />

onRecordBeforeCreateRequest((e) => {
  const employeeId = e.record.get("employee_id");
  const periodId = e.record.get("period_id");

  // 1. Validar que el período exista y esté en estado Borrador (draft)
  if (periodId) {
    try {
      const period = $app.findRecordById("payroll_periods", periodId);
      const status = period.get("status") || "draft";
      if (status !== "draft") {
        throw new BadRequestError("No se pueden registrar liquidaciones ni novedades en un período que no esté en estado Borrador.");
      }
    } catch (err) {
      if (err.status === 400) throw err;
      throw new BadRequestError("El período de nómina especificado no existe.");
    }
  }

  // 2. Validar que el empleado exista y esté ACTIVO
  if (employeeId) {
    try {
      const employee = $app.findRecordById("third_parties", employeeId);
      const isActive = employee.get("active");
      if (isActive === false) {
        throw new BadRequestError(`El empleado ${employee.get("name") || ""} está inactivo y no puede recibir liquidaciones ni novedades de nómina.`);
      }
    } catch (err) {
      if (err.status === 400) throw err;
      throw new BadRequestError("El empleado especificado no existe.");
    }
  }

  // 3. Para payroll_lines: Validar unicidad (un solo registro por empleado por período)
  if (e.collection.name === "payroll_lines" && periodId && employeeId) {
    try {
      const existing = $app.findFirstRecordByFilter(
        "payroll_lines",
        `period_id = '${periodId}' && employee_id = '${employeeId}'`
      );
      if (existing) {
        throw new BadRequestError("Ya existe una liquidación para este empleado en el período seleccionado. Edite la liquidación existente en lugar de crear una nueva.");
      }
    } catch (err) {
      if (err.status === 400) throw err;
    }
  }
}, "payroll_lines", "payroll_novelties");

onRecordBeforeUpdateRequest((e) => {
  const periodId = e.record.get("period_id");
  const employeeId = e.record.get("employee_id");

  // 1. Validar que el período esté en borrador para permitir modificaciones
  if (periodId) {
    try {
      const period = $app.findRecordById("payroll_periods", periodId);
      const status = period.get("status") || "draft";
      if (status !== "draft") {
        throw new BadRequestError("No se pueden modificar liquidaciones ni novedades de un período en estado Aprobado o Pagado. Debe reversar el período primero.");
      }
    } catch (err) {
      if (err.status === 400) throw err;
    }
  }

  // 2. Validar que el empleado esté activo
  if (employeeId) {
    try {
      const employee = $app.findRecordById("third_parties", employeeId);
      if (employee.get("active") === false) {
        throw new BadRequestError(`El empleado ${employee.get("name") || ""} está inactivo.`);
      }
    } catch (err) {
      if (err.status === 400) throw err;
    }
  }
}, "payroll_lines", "payroll_novelties");
