/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  // 1. Asegurar tipo de transacción LQ (Liquidación Definitiva de Nómina)
  try {
    const txTypesCol = $app.findCollectionByNameOrId("transaction_types");
    let lqType = null;
    try {
      lqType = $app.findFirstRecordByFilter("transaction_types", "code = 'LQ'");
    } catch (_) {
      lqType = null;
    }

    if (!lqType) {
      const rec = new Record(txTypesCol, {
        code: "LQ",
        name: "Liquidación Definitiva de Nómina",
        prefix: "LQ",
        current_number: 1,
        active: true,
        is_system: false,
        requires_balance: true
      });
      $app.save(rec);
      console.log("[GRAVY] Creado tipo de transacción contable LQ (Liquidación Definitiva).");
    }
  } catch (err) {
    console.error("[GRAVY] Error al verificar tipo de transacción LQ:", err);
  }

  // 2. Crear o actualizar colección payroll_settlements
  try {
    try {
      const col = $app.findCollectionByNameOrId("payroll_settlements");
      console.log("[GRAVY] La colección payroll_settlements ya existe.");
      let changed = false;
      if (!col.fields.getByName("created")) {
        col.fields.add(new Field({ name: "created", type: "autodate", onCreate: true, onUpdate: false }));
        changed = true;
      }
      if (!col.fields.getByName("updated")) {
        col.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }));
        changed = true;
      }
      if (changed) {
        $app.save(col);
        console.log("[GRAVY] Campos actualizados en payroll_settlements.");
      }
    } catch (_) {
      const thirdPartiesCol = $app.findCollectionByNameOrId("third_parties");
      let txCol = null;
      try { txCol = $app.findCollectionByNameOrId("transactions"); } catch (_) {}

      const settlementsCol = new Collection({
        name: "payroll_settlements",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'superadmin')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'superadmin')",
        deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'superadmin')",
        fields: [
          { name: "employee_id",              type: "relation", required: true,  collectionId: thirdPartiesCol.id, cascadeDelete: false },
          { name: "settlement_date",          type: "text",     required: true },
          { name: "hire_date",                type: "text",     required: false },
          { name: "contract_type",            type: "text",     required: false },
          { name: "reason",                   type: "text",     required: false },
          { name: "basic_salary",             type: "number",   required: false, min: 0 },
          { name: "transport_allowance",      type: "number",   required: false, min: 0 },
          { name: "base_prestaciones",        type: "number",   required: false, min: 0 },
          { name: "pending_salary_days",      type: "number",   required: false, min: 0 },
          { name: "pending_salary_amount",    type: "number",   required: false, min: 0 },
          { name: "pending_transport_amount", type: "number",   required: false, min: 0 },
          { name: "severance_days",           type: "number",   required: false, min: 0 },
          { name: "severance_amount",         type: "number",   required: false, min: 0 },
          { name: "severance_interest_amount",type: "number",   required: false, min: 0 },
          { name: "bonus_days",               type: "number",   required: false, min: 0 },
          { name: "bonus_amount",             type: "number",   required: false, min: 0 },
          { name: "vacation_days",            type: "number",   required: false, min: 0 },
          { name: "vacation_amount",          type: "number",   required: false, min: 0 },
          { name: "indemnity_amount",         type: "number",   required: false, min: 0 },
          { name: "other_earnings",           type: "number",   required: false, min: 0 },
          { name: "total_earnings",           type: "number",   required: false, min: 0 },
          { name: "health_deduction",         type: "number",   required: false, min: 0 },
          { name: "pension_deduction",        type: "number",   required: false, min: 0 },
          { name: "other_deductions",         type: "number",   required: false, min: 0 },
          { name: "total_deductions",         type: "number",   required: false, min: 0 },
          { name: "net_pay",                  type: "number",   required: false, min: 0 },
          { name: "provisions_applied",       type: "json",     required: false },
          { name: "notes",                    type: "text",     required: false },
          { name: "status",                   type: "select",   required: false, values: ["draft", "approved", "paid"] },
          { name: "tx_id",                    type: "text",     required: false },
          { name: "created",                  type: "autodate", onCreate: true,  onUpdate: false },
          { name: "updated",                  type: "autodate", onCreate: true,  onUpdate: true }
        ]
      });

      $app.save(settlementsCol);
      console.log("[GRAVY] Creada colección payroll_settlements para liquidaciones definitivas de contrato.");
    }
  } catch (err) {
    console.error("[GRAVY] Error al crear/migrar payroll_settlements:", err);
  }
});
