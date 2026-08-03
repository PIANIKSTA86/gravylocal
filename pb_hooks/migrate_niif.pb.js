/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — Migración NIIF (IFRS)
 * Crea colecciones: niif_settings, niif_policies, niif_assets, niif_leases
 * Y extiende las colecciones accounts y transactions con campos NIIF.
 */

onBootstrap((e) => {
  e.next();

  // 1. Crear niif_settings
  let hasSettings = false;
  try {
    $app.findCollectionByNameOrId("niif_settings");
    hasSettings = true;
  } catch (_) {}

  const authRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'superadmin')";

  if (!hasSettings) {
    console.log("[GRAVY-NIIF] Creando colección niif_settings...");
    try {
      const niifSettings = new Collection({
        name: "niif_settings",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: [
          { name: "grupo_empresa", type: "select", required: true, values: ["Grupo 1", "Grupo 2", "Grupo 3"] },
          { name: "moneda_funcional", type: "text", required: true },
          { name: "moneda_presentacion", type: "text", required: true },
          { name: "fecha_transicion", type: "text", required: false },
          { name: "fecha_adopcion", type: "text", required: false },
          { name: "metodo_depreciacion", type: "text", required: false },
          { name: "metodo_inventarios", type: "text", required: false },
          { name: "materialidad", type: "number", required: false },
          { name: "politicas_aprobadas", type: "bool", required: false },
          { name: "params_adicionales", type: "json", required: false }
        ]
      });
      $app.save(niifSettings);
    } catch (err) {
      console.error("[GRAVY-NIIF] Error al crear colección niif_settings:", err);
    }
  }

  // 2. Crear niif_policies
  let hasPolicies = false;
  try {
    $app.findCollectionByNameOrId("niif_policies");
    hasPolicies = true;
  } catch (_) {}

  if (!hasPolicies) {
    console.log("[GRAVY-NIIF] Creando colección niif_policies...");
    try {
      const niifPolicies = new Collection({
        name: "niif_policies",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: [
          { name: "code", type: "text", required: true },
          { name: "name", type: "text", required: true },
          { name: "standard", type: "text", required: false },
          { name: "objective", type: "text", required: false },
          { name: "scope", type: "text", required: false },
          { name: "recognition", type: "text", required: false },
          { name: "initial_measurement", type: "text", required: false },
          { name: "subsequent_measurement", type: "text", required: false },
          { name: "derecognition", type: "text", required: false },
          { name: "disclosures", type: "text", required: false },
          { name: "status", type: "select", required: true, values: ["borrador", "aprobada"] },
          { name: "version", type: "text", required: false },
          { name: "date", type: "text", required: false },
          { name: "owner", type: "text", required: false },
          { name: "history", type: "json", required: false }
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_niif_policies_code ON niif_policies (code)"
        ]
      });
      $app.save(niifPolicies);
    } catch (err) {
      console.error("[GRAVY-NIIF] Error al crear colección niif_policies:", err);
    }
  }

  // 3. Crear niif_assets
  let hasAssets = false;
  try {
    $app.findCollectionByNameOrId("niif_assets");
    hasAssets = true;
  } catch (_) {}

  if (!hasAssets) {
    console.log("[GRAVY-NIIF] Creando colección niif_assets...");
    try {
      // Obtener colecciones para relaciones
      let costCentersColId = "";
      try { costCentersColId = $app.findCollectionByNameOrId("cost_centers").id; } catch (_) {}
      let usersColId = "";
      try { usersColId = $app.findCollectionByNameOrId("users").id; } catch (_) {}

      const fields = [
        { name: "code", type: "text", required: true },
        { name: "name", type: "text", required: true },
        { name: "cost", type: "number", required: true },
        { name: "useful_life_niif", type: "number", required: true },
        { name: "useful_life_fiscal", type: "number", required: true },
        { name: "depreciation_method", type: "select", required: true, values: ["linea_recta", "saldos_decrecientes", "unidades_produccion"] },
        { name: "residual_value", type: "number", required: false },
        { name: "impairment", type: "number", required: false },
        { name: "revaluation", type: "number", required: false },
        { name: "location", type: "text", required: false },
        { name: "active", type: "bool", required: false }
      ];

      if (costCentersColId) {
        fields.push({ name: "cost_center_id", type: "relation", required: false, collectionId: costCentersColId, maxSelect: 1, cascadeDelete: false });
      }
      if (usersColId) {
        fields.push({ name: "owner_id", type: "relation", required: false, collectionId: usersColId, maxSelect: 1, cascadeDelete: false });
      }

      const niifAssets = new Collection({
        name: "niif_assets",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: fields,
        indexes: [
          "CREATE UNIQUE INDEX idx_niif_assets_code ON niif_assets (code)"
        ]
      });
      $app.save(niifAssets);
    } catch (err) {
      console.error("[GRAVY-NIIF] Error al crear colección niif_assets:", err);
    }
  }

  // 4. Crear niif_leases (NIIF 16)
  let hasLeases = false;
  try {
    $app.findCollectionByNameOrId("niif_leases");
    hasLeases = true;
  } catch (_) {}

  if (!hasLeases) {
    console.log("[GRAVY-NIIF] Creando colección niif_leases...");
    try {
      let thirdPartiesColId = "";
      try { thirdPartiesColId = $app.findCollectionByNameOrId("third_parties").id; } catch (_) {}

      const fields = [
        { name: "contract_number", type: "text", required: true },
        { name: "description", type: "text", required: true },
        { name: "start_date", type: "text", required: true },
        { name: "term_months", type: "number", required: true },
        { name: "monthly_canon", type: "number", required: true },
        { name: "implicit_interest_rate", type: "number", required: true }, // Tasa de interes mensual (ej. 0.8)
        { name: "right_of_use_value", type: "number", required: false },
        { name: "lease_liability_value", type: "number", required: false },
        { name: "amortization_table", type: "json", required: false },
        { name: "active", type: "bool", required: false }
      ];

      if (thirdPartiesColId) {
        fields.push({ name: "lessor_id", type: "relation", required: false, collectionId: thirdPartiesColId, maxSelect: 1, cascadeDelete: false });
      }

      const niifLeases = new Collection({
        name: "niif_leases",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: fields,
        indexes: [
          "CREATE UNIQUE INDEX idx_niif_leases_number ON niif_leases (contract_number)"
        ]
      });
      $app.save(niifLeases);
    } catch (err) {
      console.error("[GRAVY-NIIF] Error al crear colección niif_leases:", err);
    }
  }

  // 5. Extender colección accounts
  try {
    const accountsCol = $app.findCollectionByNameOrId("accounts");
    const fieldsSet = new Set(accountsCol.fields.fieldNames());
    let modified = false;

    if (!fieldsSet.has("niif_classification")) {
      accountsCol.fields.add(new TextField({ name: "niif_classification", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("niif_standard")) {
      accountsCol.fields.add(new TextField({ name: "niif_standard", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("niif_statement")) {
      accountsCol.fields.add(new TextField({ name: "niif_statement", required: false }));
      modified = true;
    }
    if (!fieldsSet.has("niif_cf_category")) {
      accountsCol.fields.add(new TextField({ name: "niif_cf_category", required: false }));
      modified = true;
    }

    if (modified) {
      $app.save(accountsCol);
      console.log("[GRAVY-NIIF] Colección accounts extendida con campos NIIF.");
    }
  } catch (err) {
    console.error("[GRAVY-NIIF] Error al extender la colección accounts:", err);
  }

  // 6. Extender colección transactions
  try {
    const transactionsCol = $app.findCollectionByNameOrId("transactions");
    const fieldsSet = new Set(transactionsCol.fields.fieldNames());
    let modified = false;

    if (!fieldsSet.has("book_type")) {
      transactionsCol.fields.add(new TextField({ name: "book_type", required: false }));
      modified = true;
    }

    if (modified) {
      $app.save(transactionsCol);
      console.log("[GRAVY-NIIF] Colección transactions extendida con book_type.");
    }
  } catch (err) {
    console.error("[GRAVY-NIIF] Error al extender la colección transactions:", err);
  }

  // 7. Sembrar licencia NIIF habilitada por defecto
  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    
    // Extender los valores permitidos del select para incluir "niif"
    let moduleKeyField = null;
    if (licensesCol && licensesCol.fields) {
      for (let i = 0; i < licensesCol.fields.length; i++) {
        if (licensesCol.fields[i].name === "module_key") {
          moduleKeyField = licensesCol.fields[i];
          break;
        }
      }
    }
    if (moduleKeyField) {
      const vals = moduleKeyField.values;
      if (!vals.includes("niif")) {
        vals.push("niif");
        moduleKeyField.values = vals;
        $app.save(licensesCol);
        console.log("[GRAVY-NIIF] Campo module_key de licenses extendido con 'niif'.");
      }
    }

    let hasLic = false;
    try {
      const records = $app.findRecordsByFilter("licenses", 'module_key = "niif"');
      if (records && records.length > 0) {
        hasLic = true;
      }
    } catch (_) {}

    if (!hasLic) {
      const newLic = new Record(licensesCol, {
        module_key: "niif",
        enabled: true,
        plan: "perpetua"
      });
      $app.save(newLic);
      console.log("[GRAVY-NIIF] Licencia 'niif' habilitada por defecto.");
    }
  } catch (err) {
    console.error("[GRAVY-NIIF] Error al sembrar licencia NIIF:", err);
  }
});
