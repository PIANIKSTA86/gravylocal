/**
 * GRAVY v2.0 — attendance_helpers.js
 * Módulo compartido (CommonJS) para cálculo normativo colombiano de asistencia:
 *  - Festivos oficiales Colombia (Ley Emiliani + Fijos + Semana Santa)
 *  - Clasificación minuto a minuto (CST + Ley 1846 + Ley 2101)
 *  - Algoritmo Híbrido de Almuerzo (CST Art. 167)
 */

function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysUTC(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function nextMondayUTC(date) {
  const dow = date.getUTCDay();
  if (dow === 1) return date;
  const diff = (8 - dow) % 7 || 7;
  return addDaysUTC(date, diff);
}

function fmtUTCDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getColombianHolidaysSet(year) {
  const set = {};
  const fixed = [
    [0, 1], [4, 1], [6, 20], [7, 7], [11, 8], [11, 25]
  ];
  for (let i = 0; i < fixed.length; i++) {
    set[fmtUTCDate(new Date(Date.UTC(year, fixed[i][0], fixed[i][1])))] = true;
  }

  const emiliani = [
    [0, 6], [2, 19], [5, 29], [7, 15], [9, 12], [10, 1], [10, 11]
  ];
  for (let i = 0; i < emiliani.length; i++) {
    set[fmtUTCDate(nextMondayUTC(new Date(Date.UTC(year, emiliani[i][0], emiliani[i][1]))))] = true;
  }

  const easter = getEasterSunday(year);
  set[fmtUTCDate(addDaysUTC(easter, -3))] = true;
  set[fmtUTCDate(addDaysUTC(easter, -2))] = true;
  set[fmtUTCDate(nextMondayUTC(addDaysUTC(easter, 39)))] = true;
  set[fmtUTCDate(nextMondayUTC(addDaysUTC(easter, 60)))] = true;
  set[fmtUTCDate(nextMondayUTC(addDaysUTC(easter, 68)))] = true;

  return set;
}

function isSundayOrHoliday(dateStr) {
  const parts = dateStr.split("-");
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dt = new Date(Date.UTC(y, m, d));
  if (dt.getUTCDay() === 0) return true;
  const hols = getColombianHolidaysSet(y);
  return !!hols[dateStr];
}

function getDayKey(dateStr) {
  const parts = dateStr.split("-");
  const dt = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
  const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return keys[dt.getUTCDay()];
}

function parseTimeToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return null;
  const p = hhmm.split(":");
  if (p.length < 2) return null;
  const h = parseInt(p[0], 10);
  const m = parseInt(p[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function isoToLocalMinuteOffset(isoStr, baseDateStr) {
  const dPart = isoStr.slice(0, 10);
  const tPart = isoStr.slice(11, 16);
  const mins = parseTimeToMinutes(tPart);
  if (mins === null) return null;
  if (dPart === baseDateStr) return mins;

  const baseMs = Date.parse(baseDateStr + "T00:00:00Z");
  const curMs = Date.parse(dPart + "T00:00:00Z");
  const dayDiff = Math.round((curMs - baseMs) / 86400000);
  return dayDiff * 1440 + mins;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function recomputeDailySummary(employeeId, dateStr) {
  let empShift = null;
  let shiftRec = null;
  try {
    const esList = $app.findRecordsByFilter(
      "employee_shifts",
      `employee_id = {:emp} && active = true`,
      "-created",
      1,
      0,
      { emp: employeeId }
    );
    if (esList && esList.length > 0) {
      empShift = esList[0];
      const shId = empShift.getString("shift_id");
      if (shId) shiftRec = $app.findRecordById("attendance_shifts", shId);
    }
  } catch (_) {}

  const nextDateDt = addDaysUTC(new Date(Date.parse(dateStr + "T00:00:00Z")), 1);
  const nextDateStr = fmtUTCDate(nextDateDt);

  let logs = [];
  try {
    logs = $app.findRecordsByFilter(
      "attendance_logs",
      `employee_id = {:emp} && status != 'DUPLICATE_IGNORED' && status != 'SUPERSEDED' && timestamp >= {:start} && timestamp <= {:end}`,
      "timestamp",
      50,
      0,
      { emp: employeeId, start: dateStr + "T00:00:00", end: dateStr + "T23:59:59" }
    );
  } catch (_) {
    logs = [];
  }

  const dayKey = getDayKey(dateStr);
  let daySched = null;
  if (shiftRec) {
    try {
      const sj = JSON.parse(shiftRec.getString("schedule_json") || "{}");
      daySched = sj[dayKey] || null;
    } catch (_) {}
  }

  let nextMorningOut = null;
  const isOvernightShift = daySched && daySched.enabled && parseTimeToMinutes(daySched.exit_time) < parseTimeToMinutes(daySched.entry_time);
  if (isOvernightShift) {
    try {
      const nextLogs = $app.findRecordsByFilter(
        "attendance_logs",
        `employee_id = {:emp} && status != 'DUPLICATE_IGNORED' && status != 'SUPERSEDED' && timestamp >= {:start} && timestamp <= {:end}`,
        "timestamp",
        10,
        0,
        { emp: employeeId, start: nextDateStr + "T00:00:00", end: nextDateStr + "T10:00:00" }
      );
      for (let i = 0; i < nextLogs.length; i++) {
        if (nextLogs[i].getString("punch_type") === "OUT" || nextLogs[i].getString("punch_type") === "AUTO") {
          nextMorningOut = nextLogs[i];
          break;
        }
      }
    } catch (_) {}
  }

  let firstIn = "";
  let breakOut = "";
  let breakIn = "";
  let lastOut = "";

  for (let i = 0; i < logs.length; i++) {
    const pt = logs[i].getString("punch_type");
    const ts = logs[i].getString("timestamp");
    if (pt === "IN" && !firstIn) firstIn = ts;
    else if (pt === "BREAK_OUT" && !breakOut) breakOut = ts;
    else if (pt === "BREAK_IN" && !breakIn) breakIn = ts;
    else if (pt === "OUT") lastOut = ts;
  }

  if (!lastOut && nextMorningOut) {
    lastOut = nextMorningOut.getString("timestamp");
  }
  if (!firstIn && logs.length > 0) firstIn = logs[0].getString("timestamp");
  if (!lastOut && logs.length > 1 && logs[logs.length - 1].getString("timestamp") !== firstIn) {
    lastOut = logs[logs.length - 1].getString("timestamp");
  }

  const alerts = [];
  let effectiveMinutes = 0;
  let breakDeducted = 0;
  let breakAutoApplied = false;
  let lateEntry = 0;
  let earlyExit = 0;

  let hed = 0, hen = 0, rno = 0, heddf = 0, hendf = 0, rdfd = 0, hrndf = 0;

  if (firstIn && !lastOut) {
    alerts.push("SIN_SALIDA");
  }

  if (firstIn && lastOut) {
    const inMin = isoToLocalMinuteOffset(firstIn, dateStr);
    const outMin = isoToLocalMinuteOffset(lastOut, dateStr);

    if (inMin !== null && outMin !== null && outMin > inMin) {
      let bOutMin = breakOut ? isoToLocalMinuteOffset(breakOut, dateStr) : null;
      let bInMin = breakIn ? isoToLocalMinuteOffset(breakIn, dateStr) : null;

      const totalSpan = outMin - inMin;
      const expectedBreak = daySched && daySched.break_minutes ? Number(daySched.break_minutes) : 0;
      const breakIsPaid = daySched && daySched.break_is_paid === true;

      if (bOutMin !== null && bInMin !== null && bInMin > bOutMin) {
        breakDeducted = breakIsPaid ? 0 : (bInMin - bOutMin);
      } else if (!breakIsPaid && expectedBreak > 0 && totalSpan > 300) {
        breakDeducted = expectedBreak;
        breakAutoApplied = true;
        alerts.push("ALMUERZO_AUTOAPLICADO");
        const mid = Math.floor((inMin + outMin) / 2);
        bOutMin = mid - Math.floor(expectedBreak / 2);
        bInMin = bOutMin + expectedBreak;
      }

      let scheduledMinutes = 440;
      if (daySched && daySched.enabled) {
        const sIn = parseTimeToMinutes(daySched.entry_time);
        let sOut = parseTimeToMinutes(daySched.exit_time);
        if (sIn !== null && sOut !== null) {
          if (sOut <= sIn) sOut += 1440;
          scheduledMinutes = Math.max(0, sOut - sIn - (breakIsPaid ? 0 : expectedBreak));

          const tolIn = shiftRec ? Number(shiftRec.getInt("tolerance_entry_minutes") || 0) : 10;
          const tolOut = shiftRec ? Number(shiftRec.getInt("tolerance_exit_minutes") || 0) : 10;
          if (inMin > sIn + tolIn) {
            lateEntry = inMin - sIn;
            alerts.push("TARDANZA");
          }
          if (outMin < sOut - tolOut) {
            earlyExit = sOut - outMin;
            alerts.push("SALIDA_ANTICIPADA");
          }
        }
      } else if (daySched && !daySched.enabled) {
        scheduledMinutes = 0;
      }

      let ordCount = 0;
      for (let m = inMin; m < outMin; m++) {
        if (!breakIsPaid && bOutMin !== null && bInMin !== null && m >= bOutMin && m < bInMin) {
          continue;
        }
        effectiveMinutes++;

        const dayOffset = Math.floor(m / 1440);
        const modMin = ((m % 1440) + 1440) % 1440;
        const curDateDt = addDaysUTC(new Date(Date.parse(dateStr + "T00:00:00Z")), dayOffset);
        const curDateStr = fmtUTCDate(curDateDt);

        const isNight = modMin >= 1260 || modMin < 360;
        const isHoliday = isSundayOrHoliday(curDateStr);
        const isExtra = scheduledMinutes === 0 ? isHoliday : ordCount >= scheduledMinutes;

        if (!isExtra) {
          ordCount++;
          if (isHoliday) {
            if (isNight) hrndf += 1 / 60;
            else rdfd += 1 / 60;
          } else {
            if (isNight) rno += 1 / 60;
          }
        } else {
          if (isHoliday) {
            if (isNight) hendf += 1 / 60;
            else heddf += 1 / 60;
          } else {
            if (isNight) hen += 1 / 60;
            else hed += 1 / 60;
          }
        }
      }

      const totalExtras = hed + hen + heddf + hendf;
      if (totalExtras > 2.01) {
        alerts.push("EXCESO_EXTRAS_DIARIAS");
      }
    }
  }

  const round2 = (n) => Math.round(n * 100) / 100;

  const summaryCol = $app.findCollectionByNameOrId("attendance_daily_summaries");
  let summaryRec = null;
  try {
    const existing = $app.findRecordsByFilter(
      "attendance_daily_summaries",
      `employee_id = {:emp} && date = {:dt}`,
      "",
      1,
      0,
      { emp: employeeId, dt: dateStr }
    );
    if (existing && existing.length > 0) summaryRec = existing[0];
  } catch (_) {}

  if (!summaryRec) {
    summaryRec = new Record(summaryCol);
    summaryRec.set("employee_id", employeeId);
    summaryRec.set("date", dateStr);
    summaryRec.set("status", "DRAFT");
  }

  const curStatus = summaryRec.getString("status");
  if (curStatus === "INJECTED_TO_PAYROLL") {
    return summaryRec;
  }

  summaryRec.set("shift_id", shiftRec ? shiftRec.id : "");
  summaryRec.set("first_in", firstIn);
  summaryRec.set("break_out", breakOut);
  summaryRec.set("break_in", breakIn);
  summaryRec.set("last_out", lastOut);
  summaryRec.set("effective_worked_minutes", effectiveMinutes);
  summaryRec.set("break_deducted_minutes", breakDeducted);
  summaryRec.set("break_auto_applied", breakAutoApplied);
  summaryRec.set("late_entry_minutes", lateEntry);
  summaryRec.set("early_exit_minutes", earlyExit);
  summaryRec.set("hed_hours", round2(hed));
  summaryRec.set("hen_hours", round2(hen));
  summaryRec.set("rno_hours", round2(rno));
  summaryRec.set("heddf_hours", round2(heddf));
  summaryRec.set("hendf_hours", round2(hendf));
  summaryRec.set("rdfd_hours", round2(rdfd));
  summaryRec.set("hrndf_hours", round2(hrndf));
  summaryRec.set("alerts", alerts);
  if (!curStatus) summaryRec.set("status", "DRAFT");

  $app.save(summaryRec);
  return summaryRec;
}

module.exports = {
  getColombianHolidaysSet: getColombianHolidaysSet,
  isSundayOrHoliday: isSundayOrHoliday,
  isoToLocalMinuteOffset: isoToLocalMinuteOffset,
  haversineMeters: haversineMeters,
  recomputeDailySummary: recomputeDailySummary,
};
