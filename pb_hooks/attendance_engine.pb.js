/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — attendance_engine.pb.js
 * Endpoints REST de Control de Asistencia:
 *  - POST /api/attendance/punch
 *  - POST /api/attendance/import-batch
 *  - POST /api/attendance/recalculate
 *  - POST /api/attendance/settle-period
 */

// ─── 1. REGISTRAR MARCACIÓN (KIOSCO O MÓVIL) ─────────────────────────────────
routerAdd("POST", "/api/attendance/punch", (e) => {
  const authRecord = e.auth || null;
  if (!authRecord) return e.json(401, { error: "No autenticado." });

  const helpers = require(`${__hooks}/attendance_helpers.js`);
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) { }

  const source = String(body.source || "KIOSK").toUpperCase();
  const docNumber = String(body.doc_number || "").trim();
  const kioskPin = String(body.kiosk_pin || "").trim();
  const reqEmpId = String(body.employee_id || "").trim();
  let punchType = String(body.punch_type || "AUTO").toUpperCase();
  const deviceName = String(body.device_name || (source === "MOBILE_APP" ? "App Móvil" : "Kiosco Web"));
  const photoData = String(body.photo_data || "");
  const geoLat = body.geo_lat !== undefined && body.geo_lat !== null ? Number(body.geo_lat) : null;
  const geoLng = body.geo_lng !== undefined && body.geo_lng !== null ? Number(body.geo_lng) : null;

  let empRec = null;
  try {
    if (reqEmpId) {
      empRec = $app.findRecordById("third_parties", reqEmpId);
    } else if (docNumber) {
      const list = $app.findRecordsByFilter(
        "third_parties",
        `doc_number = {:doc} && type = 'EMPLEADO' && active = true`,
        "",
        1,
        0,
        { doc: docNumber }
      );
      if (list && list.length > 0) empRec = list[0];
    }
  } catch (_) { }

  if (!empRec) {
    return e.json(404, { error: "Empleado no encontrado o inactivo. Verifique el número de documento." });
  }

  let empShift = null;
  try {
    const es = $app.findRecordsByFilter(
      "employee_shifts",
      `employee_id = {:emp} && active = true`,
      "-created",
      1,
      0,
      { emp: empRec.id }
    );
    if (es && es.length > 0) empShift = es[0];
  } catch (_) { }

  if (source === "KIOSK") {
    const configuredPin = empShift ? empShift.getString("kiosk_pin").trim() : "";
    const expectedPin = configuredPin || docNumber.slice(-4);
    if (kioskPin !== expectedPin) {
      return e.json(403, { error: "PIN de seguridad incorrecto." });
    }
  } else if (source === "MOBILE_APP") {
    if (empShift && !empShift.getBool("allow_mobile_punch")) {
      return e.json(403, { error: "El colaborador no tiene habilitado el fichaje móvil." });
    }
    if (empShift && empShift.getFloat("geo_fence_lat") && empShift.getFloat("geo_fence_lng")) {
      if (geoLat === null || geoLng === null) {
        return e.json(400, { error: "Se requiere ubicación GPS activa para marcar desde móvil." });
      }
      const dist = helpers.haversineMeters(
        geoLat,
        geoLng,
        empShift.getFloat("geo_fence_lat"),
        empShift.getFloat("geo_fence_lng")
      );
      const maxR = empShift.getFloat("geo_fence_radius_meters") || 250;
      if (dist > maxR) {
        return e.json(403, {
          error: `Fuera de geocerca permitida (${Math.round(dist)}m de distancia, máximo ${maxR}m).`
        });
      }
    }
  }

  const nowUtc = new Date();
  const colNow = new Date(nowUtc.getTime() - 5 * 3600000);
  const isoLocal = colNow.toISOString().slice(0, 19);
  const todayStr = isoLocal.slice(0, 10);

  try {
    const threeMinAgo = new Date(colNow.getTime() - 3 * 60000).toISOString().slice(0, 19);
    const recent = $app.findRecordsByFilter(
      "attendance_logs",
      `employee_id = {:emp} && status = 'VALID' && timestamp >= {:minAgo}`,
      "-timestamp",
      1,
      0,
      { emp: empRec.id, minAgo: threeMinAgo }
    );
    if (recent && recent.length > 0) {
      return e.json(200, {
        ok: false,
        duplicate: true,
        employee_name: empRec.getString("name"),
        message: "Marcación ya registrada hace menos de 3 minutos."
      });
    }
  } catch (_) { }

  if (punchType === "AUTO") {
    let todayLogs = [];
    try {
      todayLogs = $app.findRecordsByFilter(
        "attendance_logs",
        `employee_id = {:emp} && status = 'VALID' && timestamp >= {:start}`,
        "timestamp",
        10,
        0,
        { emp: empRec.id, start: todayStr + "T00:00:00" }
      );
    } catch (_) { }

    if (todayLogs.length === 0) punchType = "IN";
    else if (todayLogs.length === 1) {
      const firstMin = helpers.isoToLocalMinuteOffset(todayLogs[0].getString("timestamp"), todayStr);
      const curMin = helpers.isoToLocalMinuteOffset(isoLocal, todayStr);
      punchType = (curMin - firstMin) > 360 ? "OUT" : "BREAK_OUT";
    } else if (todayLogs.length === 2) {
      punchType = todayLogs[1].getString("punch_type") === "BREAK_OUT" ? "BREAK_IN" : "OUT";
    } else {
      punchType = "OUT";
    }
  }

  const logsCol = $app.findCollectionByNameOrId("attendance_logs");
  const logRec = new Record(logsCol);
  logRec.set("employee_id", empRec.id);
  logRec.set("timestamp", isoLocal);
  logRec.set("punch_type", punchType);
  logRec.set("source", source);
  if (photoData) logRec.set("photo_data", photoData.slice(0, 450000));
  if (geoLat !== null) logRec.set("geo_lat", geoLat);
  if (geoLng !== null) logRec.set("geo_lng", geoLng);
  logRec.set("device_name", deviceName);
  logRec.set("status", "VALID");
  $app.save(logRec);

  const summary = helpers.recomputeDailySummary(empRec.id, todayStr);

  const labels = {
    IN: "Entrada registrada",
    BREAK_OUT: "Salida a descanso / almuerzo",
    BREAK_IN: "Regreso de descanso",
    OUT: "Salida final registrada"
  };

  return e.json(200, {
    ok: true,
    employee_id: empRec.id,
    employee_name: empRec.getString("name"),
    punch_type: punchType,
    punch_label: labels[punchType] || punchType,
    timestamp: isoLocal,
    late_entry_minutes: summary ? summary.getInt("late_entry_minutes") : 0
  });
});

// ─── 2. IMPORTACIÓN MASIVA DE HUELLEROS (CSV/EXCEL/DAT) ──────────────────────
routerAdd("POST", "/api/attendance/import-batch", (e) => {
  const authRecord = e.auth || null;
  if (!authRecord) return e.json(401, { error: "No autenticado." });

  const helpers = require(`${__hooks}/attendance_helpers.js`);
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) { }
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) return e.json(400, { error: "No hay filas para importar." });

  const empByDoc = {};
  try {
    const emps = $app.findRecordsByFilter("third_parties", `type = 'EMPLEADO'`, "", 2000, 0);
    for (let i = 0; i < emps.length; i++) {
      const d = emps[i].getString("doc_number").trim();
      if (d) empByDoc[d] = emps[i].id;
    }
  } catch (_) { }

  const logsCol = $app.findCollectionByNameOrId("attendance_logs");
  let imported = 0;
  let duplicates = 0;
  const errors = [];
  const affectedPairs = {};

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const doc = String(r.doc_number || "").trim();
    const ts = String(r.timestamp || "").trim();
    const empId = empByDoc[doc];

    if (!empId) {
      errors.push(`Fila ${i + 1}: Documento "${doc}" no existe como empleado.`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(ts)) {
      errors.push(`Fila ${i + 1}: Fecha/hora inválida "${ts}".`);
      continue;
    }

    const normTs = ts.length === 16 ? ts + ":00" : ts.slice(0, 19);
    const pt = ["IN", "OUT", "BREAK_OUT", "BREAK_IN", "AUTO"].includes(String(r.punch_type || "").toUpperCase())
      ? String(r.punch_type).toUpperCase()
      : "AUTO";

    let isDup = false;
    try {
      const existing = $app.findRecordsByFilter(
        "attendance_logs",
        `employee_id = {:emp} && timestamp = {:ts}`,
        "",
        1,
        0,
        { emp: empId, ts: normTs }
      );
      if (existing && existing.length > 0) isDup = true;
    } catch (_) { }

    if (isDup) {
      duplicates++;
      continue;
    }

    const rec = new Record(logsCol);
    rec.set("employee_id", empId);
    rec.set("timestamp", normTs);
    rec.set("punch_type", pt);
    rec.set("source", "FILE_IMPORT");
    rec.set("device_name", String(r.device_name || "Huellero Importado"));
    rec.set("status", "VALID");
    $app.save(rec);

    imported++;
    const dateKey = normTs.slice(0, 10);
    affectedPairs[empId + "|" + dateKey] = [empId, dateKey];
  }

  const keys = Object.keys(affectedPairs);
  for (let i = 0; i < keys.length; i++) {
    const pair = affectedPairs[keys[i]];
    helpers.recomputeDailySummary(pair[0], pair[1]);
  }

  return e.json(200, {
    ok: true,
    imported: imported,
    duplicates: duplicates,
    recalculated_days: keys.length,
    errors: errors.slice(0, 50)
  });
});

// ─── 3. RECALCULAR RANGO DE ASISTENCIA ───────────────────────────────────────
routerAdd("POST", "/api/attendance/recalculate", (e) => {
  const authRecord = e.auth || null;
  if (!authRecord) return e.json(401, { error: "No autenticado." });

  const helpers = require(`${__hooks}/attendance_helpers.js`);
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) { }
  const dateFrom = String(body.date_from || "");
  const dateTo = String(body.date_to || "");
  const empFilter = String(body.employee_id || "");

  if (!dateFrom || !dateTo) return e.json(400, { error: "Se requiere date_from y date_to." });

  let filterStr = `status = 'VALID' && timestamp >= {:start} && timestamp <= {:end}`;
  const params = { start: dateFrom + "T00:00:00", end: dateTo + "T23:59:59" };
  if (empFilter) {
    filterStr += ` && employee_id = {:emp}`;
    params.emp = empFilter;
  }

  const logs = $app.findRecordsByFilter("attendance_logs", filterStr, "timestamp", 5000, 0, params);
  const pairs = {};
  for (let i = 0; i < logs.length; i++) {
    const empId = logs[i].getString("employee_id");
    const dStr = logs[i].getString("timestamp").slice(0, 10);
    pairs[empId + "|" + dStr] = [empId, dStr];
  }

  const keys = Object.keys(pairs);
  for (let i = 0; i < keys.length; i++) {
    helpers.recomputeDailySummary(pairs[keys[i]][0], pairs[keys[i]][1]);
  }

  return e.json(200, { ok: true, recalculated_days: keys.length });
});

// ─── 4. TRASLADAR A NOVEDADES DE NÓMINA ──────────────────────────────────────
routerAdd("POST", "/api/attendance/settle-period", (e) => {
  const authRecord = e.auth || null;
  if (!authRecord) return e.json(401, { error: "No autenticado." });

  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) { }
  const periodId = String(body.period_id || "").trim();
  const dateFrom = String(body.date_from || "").trim();
  const dateTo = String(body.date_to || "").trim();
  const includeDraft = body.include_draft !== false;

  if (!periodId || !dateFrom || !dateTo) {
    return e.json(400, { error: "Se requiere period_id, date_from y date_to." });
  }

  let weeklyHours = 44;
  const salaryByEmp = {};
  try {
    const coreRecs = $app.findRecordsByFilter("settings", `key = 'payroll_accounting_config_v1_core'`, "", 1, 0);
    if (coreRecs && coreRecs.length > 0) {
      const coreVal = JSON.parse(coreRecs[0].getString("value") || "{}");
      if (coreVal.company_rules && coreVal.company_rules.weekly_hours) {
        weeklyHours = Number(coreVal.company_rules.weekly_hours) || 44;
      }
    }
    const ruleRecs = $app.findRecordsByFilter("settings", `key ~ 'payroll_accounting_config_v1_employee_rules'`, "key", 20, 0);
    let rawJson = "";
    for (let i = 0; i < ruleRecs.length; i++) {
      rawJson += ruleRecs[i].getString("value") || "";
    }
    if (rawJson) {
      const rules = JSON.parse(rawJson);
      if (Array.isArray(rules)) {
        for (let i = 0; i < rules.length; i++) {
          if (rules[i].employee_id && rules[i].basic_salary) {
            salaryByEmp[rules[i].employee_id] = Number(rules[i].basic_salary);
          }
        }
      }
    }
  } catch (_) { }

  const monthlyHours = (weeklyHours / 6) * 30;

  const statusFilter = includeDraft
    ? `(status = 'DRAFT' || status = 'AUDITED' || status = 'APPROVED')`
    : `(status = 'AUDITED' || status = 'APPROVED')`;

  const summaries = $app.findRecordsByFilter(
    "attendance_daily_summaries",
    `date >= {:from} && date <= {:to} && ${statusFilter}`,
    "date",
    5000,
    0,
    { from: dateFrom, to: dateTo }
  );

  if (!summaries || summaries.length === 0) {
    return e.json(200, { ok: true, injected_novelties: 0, message: "No hay resúmenes pendientes por inyectar." });
  }

  const aggByEmp = {};
  for (let i = 0; i < summaries.length; i++) {
    const s = summaries[i];
    const empId = s.getString("employee_id");
    if (!aggByEmp[empId]) {
      aggByEmp[empId] = { hed: 0, hen: 0, rno: 0, heddf: 0, hendf: 0, rdfd: 0, hrndf: 0, recs: [] };
    }
    aggByEmp[empId].hed += s.getFloat("hed_hours") || 0;
    aggByEmp[empId].hen += s.getFloat("hen_hours") || 0;
    aggByEmp[empId].rno += s.getFloat("rno_hours") || 0;
    aggByEmp[empId].heddf += s.getFloat("heddf_hours") || 0;
    aggByEmp[empId].hendf += s.getFloat("hendf_hours") || 0;
    aggByEmp[empId].rdfd += s.getFloat("rdfd_hours") || 0;
    aggByEmp[empId].hrndf += s.getFloat("hrndf_hours") || 0;
    aggByEmp[empId].recs.push(s);
  }

  const noveltyDefs = [
    { field: "hed", type: "HORA_EXTRA_DIURNA", factor: 1.25 },
    { field: "hen", type: "HORA_EXTRA_NOCTURNA", factor: 1.75 },
    { field: "rno", type: "RECARGO_NOCTURNO", factor: 0.35 },
    { field: "heddf", type: "HORA_EXTRA_DOMINICAL", factor: 2.00 },
    { field: "hendf", type: "HORA_EXTRA_DOMINICAL_NOCTURNA", factor: 2.50 },
    { field: "rdfd", type: "RECARGO_DOMINICAL", factor: 0.75 },
    { field: "hrndf", type: "RECARGO_DOMINICAL_NOCTURNO", factor: 1.10 }
  ];

  const novCol = $app.findCollectionByNameOrId("payroll_novelties");
  let injectedCount = 0;
  const empIds = Object.keys(aggByEmp);

  for (let i = 0; i < empIds.length; i++) {
    const empId = empIds[i];
    const data = aggByEmp[empId];
    const basicSalary = salaryByEmp[empId] || 1750905;
    const hourRate = basicSalary / monthlyHours;

    for (let j = 0; j < noveltyDefs.length; j++) {
      const def = noveltyDefs[j];
      const hrs = Math.round((data[def.field] || 0) * 100) / 100;
      if (hrs <= 0) continue;

      const amount = Math.round(hrs * hourRate * def.factor);
      const supportTag = `ASISTENCIA-${periodId}`;

      let novRec = null;
      try {
        const existing = $app.findRecordsByFilter(
          "payroll_novelties",
          `period_id = {:pid} && employee_id = {:emp} && type = {:t} && support_number = {:sup}`,
          "",
          1,
          0,
          { pid: periodId, emp: empId, t: def.type, sup: supportTag }
        );
        if (existing && existing.length > 0) novRec = existing[0];
      } catch (_) { }

      if (!novRec) {
        novRec = new Record(novCol);
        novRec.set("period_id", periodId);
        novRec.set("employee_id", empId);
        novRec.set("type", def.type);
        novRec.set("support_number", supportTag);
      }

      novRec.set("date_from", dateFrom);
      novRec.set("date_to", dateTo);
      novRec.set("qty", hrs);
      novRec.set("amount", amount);
      novRec.set("description", `Consolidado automático de asistencia (${hrs}h x ${def.factor} sobre base ${monthlyHours}h/mes)`);
      novRec.set("status", "draft");
      $app.save(novRec);
      injectedCount++;
    }

    for (let k = 0; k < data.recs.length; k++) {
      data.recs[k].set("status", "INJECTED_TO_PAYROLL");
      $app.save(data.recs[k]);
    }
  }

  return e.json(200, {
    ok: true,
    injected_novelties: injectedCount,
    employees_processed: empIds.length,
    weekly_hours_used: weeklyHours
  });
});

// ─── 5. AJUSTE MANUAL DE TIEMPOS POR SUPERVISOR ──────────────────────────────
routerAdd("POST", "/api/attendance/manual-adjust", (e) => {
  const authRecord = e.auth || null;
  if (!authRecord) return e.json(401, { error: "No autenticado." });

  const helpers = require(`${__hooks}/attendance_helpers.js`);
  let body = {};
  try { body = e.requestInfo().body || {}; } catch (_) {}

  const employeeId = String(body.employee_id || "").trim();
  const dateStr = String(body.date || "").trim();
  const auditNotes = String(body.audit_notes || "").trim();
  const firstIn = String(body.first_in || "").trim();
  const breakOut = String(body.break_out || "").trim();
  const breakIn = String(body.break_in || "").trim();
  const lastOut = String(body.last_out || "").trim();

  if (!employeeId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return e.json(400, { error: "Se requiere employee_id y date (YYYY-MM-DD)." });
  }

  // Marcar logs previos del día como SUPERSEDED (preservando historial forense y fotos)
  try {
    const oldLogs = $app.findRecordsByFilter(
      "attendance_logs",
      `employee_id = {:emp} && status = 'VALID' && timestamp >= {:start} && timestamp <= {:end}`,
      "timestamp",
      100,
      0,
      { emp: employeeId, start: dateStr + "T00:00:00", end: dateStr + "T23:59:59" }
    );
    for (let i = 0; i < oldLogs.length; i++) {
      oldLogs[i].set("status", "SUPERSEDED");
      $app.save(oldLogs[i]);
    }
  } catch (_) {}

  const logsCol = $app.findCollectionByNameOrId("attendance_logs");
  const supervisorName = authRecord.getString("full_name") || authRecord.getString("name") || authRecord.getString("email") || "Supervisor";
  const noteText = `[Ajuste por ${supervisorName}] ${auditNotes || "Corrección manual de horario"}`;

  const points = [
    { type: "IN", time: firstIn },
    { type: "BREAK_OUT", time: breakOut },
    { type: "BREAK_IN", time: breakIn },
    { type: "OUT", time: lastOut },
  ];

  // Detectar si salida es del día siguiente (ej. turno nocturno 21:00 -> 05:00)
  let inMins = null;
  if (firstIn && /^\d{2}:\d{2}/.test(firstIn)) {
    const p = firstIn.split(":");
    inMins = parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (!pt.time || !/^\d{2}:\d{2}/.test(pt.time)) continue;

    let targetDate = dateStr;
    if (pt.type === "OUT" && inMins !== null) {
      const op = pt.time.split(":");
      const outMins = parseInt(op[0], 10) * 60 + parseInt(op[1], 10);
      if (outMins < inMins) {
        const dt = new Date(Date.parse(dateStr + "T00:00:00Z") + 86400000);
        targetDate = dt.toISOString().slice(0, 10);
      }
    }

    const rec = new Record(logsCol);
    rec.set("employee_id", employeeId);
    rec.set("timestamp", `${targetDate}T${pt.time.slice(0, 5)}:00`);
    rec.set("punch_type", pt.type);
    rec.set("source", "MANUAL_ADJUSTMENT");
    rec.set("device_name", "Panel Supervisor");
    rec.set("status", "VALID");
    rec.set("audit_notes", noteText);
    $app.save(rec);
  }

  const summary = helpers.recomputeDailySummary(employeeId, dateStr);
  if (summary && summary.getString("status") !== "INJECTED_TO_PAYROLL") {
    summary.set("status", "AUDITED");
    $app.save(summary);
  }

  return e.json(200, { ok: true, summary_id: summary ? summary.id : "" });
});
