/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  // 1. Crear o actualizar colección cash_concepts
  let cashConcepts;
  try {
    cashConcepts = $app.findCollectionByNameOrId("cash_concepts");
    // Ya existe, actualizar reglas para incluir administrador y auxiliar
    cashConcepts.createRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin' || @request.auth.role = 'contador' || @request.auth.role = 'administrador' || @request.auth.role = 'auxiliar')";
    cashConcepts.updateRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin' || @request.auth.role = 'contador' || @request.auth.role = 'administrador' || @request.auth.role = 'auxiliar')";
    cashConcepts.deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin' || @request.auth.role = 'contador' || @request.auth.role = 'administrador' || @request.auth.role = 'auxiliar')";
    $app.save(cashConcepts);
    console.log("[GRAVY] Actualizadas reglas de la colección cash_concepts.");
  } catch (_) {
    try {
      const accounts = $app.findCollectionByNameOrId("accounts");
      cashConcepts = new Collection({
        name: "cash_concepts",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin' || @request.auth.role = 'contador' || @request.auth.role = 'administrador' || @request.auth.role = 'auxiliar')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin' || @request.auth.role = 'contador' || @request.auth.role = 'administrador' || @request.auth.role = 'auxiliar')",
        deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin' || @request.auth.role = 'contador' || @request.auth.role = 'administrador' || @request.auth.role = 'auxiliar')",
        fields: [
          { name: "name", type: "text", required: true },
          { name: "type", type: "select", required: true, values: ["egreso", "recaudo"] },
          { name: "account_id", type: "relation", required: true, collectionId: accounts.id, cascadeDelete: false },
          { name: "description", type: "text", required: false },
          { name: "active", type: "bool", required: false }
        ]
      });
      $app.save(cashConcepts);
      console.log("[GRAVY] Creada colección cash_concepts.");

      // Pre-cargar conceptos por defecto
      const defaultConcepts = [
        { name: "Pago de Servicios Públicos", type: "egreso", code: "5135" },
        { name: "Fletes y Acarreos", type: "egreso", code: "5195" },
        { name: "Jornales / Día de Trabajo", type: "egreso", code: "5105" },
        { name: "Papelería y Útiles de Oficina", type: "egreso", code: "5195" },
        { name: "Restaurante y Alimentación", type: "egreso", code: "5195" },
        { name: "Recaudo Directo de Caja", type: "recaudo", code: "110505" }
      ];

      for (const dc of defaultConcepts) {
        try {
          const acc = $app.findFirstRecordByFilter("accounts", `code="${dc.code}"`);
          if (acc) {
            const rec = new Record(cashConcepts);
            rec.set("name", dc.name);
            rec.set("type", dc.type);
            rec.set("account_id", acc.id);
            rec.set("active", true);
            rec.set("description", "Concepto preconfigurado por defecto");
            $app.save(rec);
          }
        } catch(err) {
          console.error("[GRAVY] Error creando concepto por defecto:", dc.name, err);
        }
      }
    } catch (err) {
      console.error("[GRAVY] Error creando cash_concepts:", err);
    }
  }

  // 2. Agregar campos cash_recaudos y cash_egresos a pos_shifts si no existen
  try {
    const posShifts = $app.findCollectionByNameOrId("pos_shifts");
    let changed = false;
    if (!posShifts.fields.getByName("cash_recaudos")) {
      posShifts.fields.add(new Field({
        name: "cash_recaudos",
        type: "number",
        required: false
      }));
      changed = true;
    }
    if (!posShifts.fields.getByName("cash_egresos")) {
      posShifts.fields.add(new Field({
        name: "cash_egresos",
        type: "number",
        required: false
      }));
      changed = true;
    }
    if (!posShifts.fields.getByName("bank_recaudos")) {
      posShifts.fields.add(new Field({
        name: "bank_recaudos",
        type: "number",
        required: false
      }));
      changed = true;
    }
    if (!posShifts.fields.getByName("bank_egresos")) {
      posShifts.fields.add(new Field({
        name: "bank_egresos",
        type: "number",
        required: false
      }));
      changed = true;
    }
    if (changed) {
      $app.save(posShifts);
      console.log("[GRAVY] Agregados campos de recaudos y egresos (efectivo y bancos) a pos_shifts.");
    }
  } catch(err) {
    console.error("[GRAVY] Error modificando pos_shifts:", err);
  }

  // 3. Agregar campo pos_shift_id a transactions si no existe
  try {
    const transactions = $app.findCollectionByNameOrId("transactions");
    if (!transactions.fields.getByName("pos_shift_id")) {
      const posShifts = $app.findCollectionByNameOrId("pos_shifts");
      transactions.fields.add(new Field({
        name: "pos_shift_id",
        type: "relation",
        collectionId: posShifts.id,
        cascadeDelete: false,
        required: false
      }));
      $app.save(transactions);
      console.log("[GRAVY] Agregado campo pos_shift_id a transactions.");
    }
  } catch(err) {
    console.error("[GRAVY] Error agregando pos_shift_id a transactions:", err);
  }
});
