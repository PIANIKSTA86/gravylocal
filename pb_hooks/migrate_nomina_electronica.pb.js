/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  // 1. Crear colección payroll_novelties si no existe
  try {
    try {
      const col = $app.findCollectionByNameOrId("payroll_novelties");
      console.log("[GRAVY] La colección payroll_novelties ya existe.");
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
        console.log("[GRAVY] Campos created y updated agregados a payroll_novelties.");
      }
    } catch (_) {
      // Obtener dependencias de colecciones
      const periodsCol = $app.findCollectionByNameOrId("payroll_periods");
      const thirdPartiesCol = $app.findCollectionByNameOrId("third_parties");

      const noveltiesCol = new Collection({
        name: "payroll_novelties",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        fields: [
          { name: "period_id",      type: "relation", required: true,  collectionId: periodsCol.id, cascadeDelete: true },
          { name: "employee_id",    type: "relation", required: true,  collectionId: thirdPartiesCol.id, cascadeDelete: false },
          { name: "type",           type: "text",     required: true },
          { name: "date_from",      type: "text",     required: true },
          { name: "date_to",        type: "text",     required: false },
          { name: "qty",            type: "number",   required: false, min: 0 },
          { name: "amount",         type: "number",   required: false, min: 0 },
          { name: "support_number", type: "text",     required: false },
          { name: "description",    type: "text",     required: false },
          { name: "status",         type: "select",   required: false, values: ["draft", "processed"] },
          { name: "created",        type: "autodate", onCreate: true,  onUpdate: false },
          { name: "updated",        type: "autodate", onCreate: true,  onUpdate: true }
        ]
      });

      $app.save(noveltiesCol);
      console.log("[GRAVY] Creada colección payroll_novelties para novedades de nómina.");
    }
  } catch (err) {
    console.error("[GRAVY] Error al migrar la colección payroll_novelties:", err);
  }

  // 2. Crear colección electronic_payrolls si no existe
  try {
    try {
      const col = $app.findCollectionByNameOrId("electronic_payrolls");
      console.log("[GRAVY] La colección electronic_payrolls ya existe.");
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
        console.log("[GRAVY] Campos created y updated agregados a electronic_payrolls.");
      }
    } catch (_) {
      const periodsCol = $app.findCollectionByNameOrId("payroll_periods");

      const electronicCol = new Collection({
        name: "electronic_payrolls",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "periodo_id",      type: "relation", required: false, collectionId: periodsCol.id, cascadeDelete: false },
          { name: "ano",             type: "number",   required: true },
          { name: "mes",             type: "number",   required: true },
          { name: "tipo_ambiente",   type: "text",     required: false },
          { name: "numero_envio",    type: "number",   required: false },
          { name: "fecha_envio",     type: "text",     required: false },
          { name: "xml_generado",    type: "text",     required: false },
          { name: "estado_dian",     type: "text",     required: false },
          { name: "cufe",            type: "text",     required: false },
          { name: "total_devengos",  type: "number",   required: false },
          { name: "total_deducciones", type: "number", required: false },
          { name: "total_neto",      type: "number",   required: false },
          { name: "total_empleador", type: "number",   required: false },
          { name: "total_empleados", type: "number",   required: false },
          { name: "created",        type: "autodate", onCreate: true,  onUpdate: false },
          { name: "updated",        type: "autodate", onCreate: true,  onUpdate: true }
        ]
      });

      $app.save(electronicCol);
      console.log("[GRAVY] Creada colección electronic_payrolls para nómina electrónica.");
    }
  } catch (err) {
    console.error("[GRAVY] Error al migrar la colección electronic_payrolls:", err);
  }

  // 3. Crear colección payroll_documents si no existe
  try {
    try {
      const col = $app.findCollectionByNameOrId("payroll_documents");
      console.log("[GRAVY] La colección payroll_documents ya existe.");
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
        console.log("[GRAVY] Campos created y updated agregados a payroll_documents.");
      }
    } catch (_) {
      const thirdPartiesCol = $app.findCollectionByNameOrId("third_parties");

      const documentsCol = new Collection({
        name: "payroll_documents",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users'",
        updateRule: "@request.auth.collectionName = 'users'",
        deleteRule: "@request.auth.collectionName = 'users'",
        fields: [
          { name: "employee_id", type: "relation", required: true, collectionId: thirdPartiesCol.id, cascadeDelete: true },
          { name: "category",    type: "select",   required: true, values: ["HOJA_VIDA", "ESTUDIOS", "SEGURIDAD_SOCIAL", "EXAMEN_MEDICO", "HISTORIA_CLINICA", "OTRO"] },
          { name: "file",        type: "file",     required: true, maxSelect: 1 },
          { name: "name",        type: "text",     required: true },
          { name: "date",        type: "text",     required: false },
          { name: "created",        type: "autodate", onCreate: true,  onUpdate: false },
          { name: "updated",        type: "autodate", onCreate: true,  onUpdate: true }
        ]
      });

      $app.save(documentsCol);
      console.log("[GRAVY] Creada colección payroll_documents para archivos de empleados.");
    }
  } catch (err) {
    console.error("[GRAVY] Error al migrar la colección payroll_documents:", err);
  }
  // 4. Asegurar que tx_id en payroll_periods sea multi-relación (maxSelect >= 2)
  //    Instancias existentes pueden tener maxSelect=0 o maxSelect=1 (single-select),
  //    lo que impide guardar múltiples comprobantes (uno por empleado).
  try {
    const periodsCol = $app.findCollectionByNameOrId("payroll_periods");
    const txIdField = periodsCol.fields.getByName("tx_id");
    if (txIdField && (txIdField.maxSelect === 0 || txIdField.maxSelect === 1)) {
      txIdField.maxSelect = 999;
      $app.save(periodsCol);
      console.log("[GRAVY] Campo tx_id en payroll_periods actualizado a multi-relación (maxSelect=999).");
    }
  } catch (err) {
    console.error("[GRAVY] Error al migrar maxSelect de tx_id en payroll_periods:", err);
  }
});
