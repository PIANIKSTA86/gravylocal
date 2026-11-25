/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_attendance.pb.js
 * Crea y mantiene las colecciones del módulo de Control de Asistencia y Turnos:
 *  - attendance_shifts
 *  - employee_shifts
 *  - attendance_logs
 *  - attendance_daily_summaries
 * Además crea índices SQLite y plantillas de turno iniciales (Ley 2101 - 44h/42h).
 */

onBootstrap((e) => {
  e.next();

  const authRuleRead = "@request.auth.id != ''";
  const authRuleAdmin = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const authRuleStrict = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";

  let thirdPartiesColId = "";
  try {
    thirdPartiesColId = $app.findCollectionByNameOrId("third_parties").id;
  } catch (_) {
    console.error("[GRAVY Attendance] No se encontró third_parties.");
    return;
  }

  // 1. attendance_shifts
  let shiftsColId = "";
  try {
    const col = $app.findCollectionByNameOrId("attendance_shifts");
    shiftsColId = col.id;
  } catch (_) {
    try {
      const col = new Collection({
        name: "attendance_shifts",
        type: "base",
        listRule: authRuleRead,
        viewRule: authRuleRead,
        createRule: authRuleAdmin,
        updateRule: authRuleAdmin,
        deleteRule: authRuleStrict,
        fields: [
          { name: "name",                    type: "text",     required: true },
          { name: "code",                    type: "text",     required: true },
          { name: "schedule_json",           type: "json",     required: true },
          { name: "tolerance_entry_minutes", type: "number",   required: false, min: 0 },
          { name: "tolerance_exit_minutes",  type: "number",   required: false, min: 0 },
          { name: "active",                  type: "bool",     required: false },
          { name: "created",                 type: "autodate", onCreate: true,  onUpdate: false },
          { name: "updated",                 type: "autodate", onCreate: true,  onUpdate: true }
        ]
      });
      $app.save(col);
      shiftsColId = col.id;
      console.log("[GRAVY Attendance] Creada colección attendance_shifts.");

      // Seed de plantillas iniciales
      const defaultSchedules = [
        {
          name: "Turno Administrativo (44h Semanales)",
          code: "ADM-44",
          tolerance_entry_minutes: 10,
          tolerance_exit_minutes: 10,
          schedule_json: {
            mon: { enabled: true, entry_time: "08:00", exit_time: "17:00", break_start: "12:00", break_end: "13:00", break_minutes: 60, break_is_paid: false },
            tue: { enabled: true, entry_time: "08:00", exit_time: "17:00", break_start: "12:00", break_end: "13:00", break_minutes: 60, break_is_paid: false },
            wed: { enabled: true, entry_time: "08:00", exit_time: "17:00", break_start: "12:00", break_end: "13:00", break_minutes: 60, break_is_paid: false },
            thu: { enabled: true, entry_time: "08:00", exit_time: "17:00", break_start: "12:00", break_end: "13:00", break_minutes: 60, break_is_paid: false },
            fri: { enabled: true, entry_time: "08:00", exit_time: "17:00", break_start: "12:00", break_end: "13:00", break_minutes: 60, break_is_paid: false },
            sat: { enabled: true, entry_time: "08:00", exit_time: "12:00", break_start: "", break_end: "", break_minutes: 0, break_is_paid: false },
            sun: { enabled: false, entry_time: "", exit_time: "", break_start: "", break_end: "", break_minutes: 0, break_is_paid: false }
          }
        },
        {
          name: "Turno Operativo Nocturno (21:00 - 05:00)",
          code: "OP-NOC",
          tolerance_entry_minutes: 10,
          tolerance_exit_minutes: 10,
          schedule_json: {
            mon: { enabled: true, entry_time: "21:00", exit_time: "05:00", break_start: "01:00", break_end: "01:30", break_minutes: 30, break_is_paid: false },
            tue: { enabled: true, entry_time: "21:00", exit_time: "05:00", break_start: "01:00", break_end: "01:30", break_minutes: 30, break_is_paid: false },
            wed: { enabled: true, entry_time: "21:00", exit_time: "05:00", break_start: "01:00", break_end: "01:30", break_minutes: 30, break_is_paid: false },
            thu: { enabled: true, entry_time: "21:00", exit_time: "05:00", break_start: "01:00", break_end: "01:30", break_minutes: 30, break_is_paid: false },
            fri: { enabled: true, entry_time: "21:00", exit_time: "05:00", break_start: "01:00", break_end: "01:30", break_minutes: 30, break_is_paid: false },
            sat: { enabled: true, entry_time: "21:00", exit_time: "03:00", break_start: "", break_end: "", break_minutes: 0, break_is_paid: false },
            sun: { enabled: false, entry_time: "", exit_time: "", break_start: "", break_end: "", break_minutes: 0, break_is_paid: false }
          }
        }
      ];

      for (let i = 0; i < defaultSchedules.length; i++) {
        const s = defaultSchedules[i];
        const rec = new Record(col);
        rec.set("name", s.name);
        rec.set("code", s.code);
        rec.set("schedule_json", s.schedule_json);
        rec.set("tolerance_entry_minutes", s.tolerance_entry_minutes);
        rec.set("tolerance_exit_minutes", s.tolerance_exit_minutes);
        rec.set("active", true);
        $app.save(rec);
      }
    } catch (err) {
      console.error("[GRAVY Attendance] Error creando attendance_shifts:", err);
    }
  }

  // 2. employee_shifts
  if (shiftsColId) {
    try {
      $app.findCollectionByNameOrId("employee_shifts");
    } catch (_) {
      try {
        const col = new Collection({
          name: "employee_shifts",
          type: "base",
          listRule: authRuleRead,
          viewRule: authRuleRead,
          createRule: authRuleAdmin,
          updateRule: authRuleAdmin,
          deleteRule: authRuleStrict,
          fields: [
            { name: "employee_id",             type: "relation", required: true,  collectionId: thirdPartiesColId, cascadeDelete: true },
            { name: "shift_id",                type: "relation", required: true,  collectionId: shiftsColId,       cascadeDelete: false },
            { name: "valid_from",              type: "text",     required: false },
            { name: "valid_to",                type: "text",     required: false },
            { name: "kiosk_pin",               type: "text",     required: false },
            { name: "allow_mobile_punch",      type: "bool",     required: false },
            { name: "geo_fence_lat",           type: "number",   required: false },
            { name: "geo_fence_lng",           type: "number",   required: false },
            { name: "geo_fence_radius_meters", type: "number",   required: false },
            { name: "active",                  type: "bool",     required: false },
            { name: "created",                 type: "autodate", onCreate: true,  onUpdate: false },
            { name: "updated",                 type: "autodate", onCreate: true,  onUpdate: true }
          ]
        });
        $app.save(col);
        console.log("[GRAVY Attendance] Creada colección employee_shifts.");
      } catch (err) {
        console.error("[GRAVY Attendance] Error creando employee_shifts:", err);
      }
    }
  }

  // 3. attendance_logs
  try {
    const col = $app.findCollectionByNameOrId("attendance_logs");
    let changed = false;
    const pf = col.fields.getByName("photo_data");
    if (pf && (!pf.max || pf.max < 500000)) {
      pf.max = 500000;
      changed = true;
    }
    if (!col.fields.getByName("geo_address")) {
      col.fields.add(new Field({ name: "geo_address", type: "text", required: false }));
      changed = true;
    }
    if (changed) {
      $app.save(col);
      console.log("[GRAVY Attendance] Actualizada colección attendance_logs.");
    }
  } catch (_) {
    try {
      const col = new Collection({
        name: "attendance_logs",
        type: "base",
        listRule: authRuleRead,
        viewRule: authRuleRead,
        createRule: authRuleRead,
        updateRule: authRuleAdmin,
        deleteRule: authRuleStrict,
        fields: [
          { name: "employee_id", type: "relation", required: true,  collectionId: thirdPartiesColId, cascadeDelete: true },
          { name: "timestamp",   type: "text",     required: true },
          { name: "punch_type",  type: "select",   required: true,  values: ["IN", "OUT", "BREAK_OUT", "BREAK_IN", "AUTO"] },
          { name: "source",      type: "select",   required: true,  values: ["KIOSK", "MOBILE_APP", "FILE_IMPORT", "MANUAL_ADJUSTMENT"] },
          { name: "photo_data",  type: "text",     required: false, max: 500000 },
          { name: "geo_lat",     type: "number",   required: false },
          { name: "geo_lng",     type: "number",   required: false },
          { name: "geo_address", type: "text",     required: false },
          { name: "device_name", type: "text",     required: false },
          { name: "status",      type: "select",   required: true,  values: ["VALID", "DUPLICATE_IGNORED", "SUPERSEDED", "MANUAL"] },
          { name: "audit_notes", type: "text",     required: false },
          { name: "created",     type: "autodate", onCreate: true,  onUpdate: false },
          { name: "updated",     type: "autodate", onCreate: true,  onUpdate: true }
        ]
      });
      $app.save(col);
      console.log("[GRAVY Attendance] Creada colección attendance_logs.");
    } catch (err) {
      console.error("[GRAVY Attendance] Error creando attendance_logs:", err);
    }
  }

  // 4. attendance_daily_summaries
  if (shiftsColId) {
    try {
      $app.findCollectionByNameOrId("attendance_daily_summaries");
    } catch (_) {
      try {
        const col = new Collection({
          name: "attendance_daily_summaries",
          type: "base",
          listRule: authRuleRead,
          viewRule: authRuleRead,
          createRule: authRuleAdmin,
          updateRule: authRuleAdmin,
          deleteRule: authRuleStrict,
          fields: [
            { name: "employee_id",              type: "relation", required: true,  collectionId: thirdPartiesColId, cascadeDelete: true },
            { name: "date",                     type: "text",     required: true },
            { name: "shift_id",                 type: "relation", required: false, collectionId: shiftsColId,       cascadeDelete: false },
            { name: "first_in",                 type: "text",     required: false },
            { name: "break_out",                type: "text",     required: false },
            { name: "break_in",                 type: "text",     required: false },
            { name: "last_out",                 type: "text",     required: false },
            { name: "effective_worked_minutes", type: "number",   required: false },
            { name: "break_deducted_minutes",   type: "number",   required: false },
            { name: "break_auto_applied",       type: "bool",     required: false },
            { name: "late_entry_minutes",       type: "number",   required: false },
            { name: "early_exit_minutes",       type: "number",   required: false },
            { name: "hed_hours",                type: "number",   required: false },
            { name: "hen_hours",                type: "number",   required: false },
            { name: "rno_hours",                type: "number",   required: false },
            { name: "heddf_hours",              type: "number",   required: false },
            { name: "hendf_hours",              type: "number",   required: false },
            { name: "rdfd_hours",               type: "number",   required: false },
            { name: "hrndf_hours",              type: "number",   required: false },
            { name: "alerts",                   type: "json",     required: false },
            { name: "status",                   type: "select",   required: true,  values: ["DRAFT", "AUDITED", "APPROVED", "INJECTED_TO_PAYROLL"] },
            { name: "created",                  type: "autodate", onCreate: true,  onUpdate: false },
            { name: "updated",                  type: "autodate", onCreate: true,  onUpdate: true }
          ]
        });
        $app.save(col);
        console.log("[GRAVY Attendance] Creada colección attendance_daily_summaries.");
      } catch (err) {
        console.error("[GRAVY Attendance] Error creando attendance_daily_summaries:", err);
      }
    }
  }

  // 5. Índices SQLite para rendimiento
  try {
    $app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_att_logs_emp_time ON attendance_logs(employee_id, timestamp)").execute();
    $app.db().newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_att_daily_emp_date ON attendance_daily_summaries(employee_id, date)").execute();
    $app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_att_emp_shift_emp ON employee_shifts(employee_id, active)").execute();
  } catch (err) {
    console.warn("[GRAVY Attendance] Aviso creando índices:", err);
  }
});
