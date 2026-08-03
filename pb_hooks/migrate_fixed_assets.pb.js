/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_fixed_assets.pb.js
 * Crea colecciones: niif_asset_categories, niif_asset_events, niif_asset_inventories
 * Y extiende la colección niif_assets con campos del ciclo de vida del activo.
 */

onBootstrap((e) => {
  e.next();

  const authRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'superadmin')";

  // 1. Obtener referencias de otras colecciones para relaciones
  let accountsColId = "";
  try { accountsColId = $app.findCollectionByNameOrId("accounts").id; } catch (_) {}
  let thirdPartiesColId = "";
  try { thirdPartiesColId = $app.findCollectionByNameOrId("third_parties").id; } catch (_) {}
  let usersColId = "";
  try {
    usersColId = $app.findCollectionByNameOrId("users").id;
  } catch (_) {
    try { usersColId = $app.findCollectionByNameOrId("_pb_users_auth_").id; } catch (_2) {}
  }
  let costCentersColId = "";
  try { costCentersColId = $app.findCollectionByNameOrId("cost_centers").id; } catch (_) {}
  let transactionsColId = "";
  try { transactionsColId = $app.findCollectionByNameOrId("transactions").id; } catch (_) {}

  // 2. Crear niif_asset_categories (Categorías)
  let hasCategories = false;
  let categoriesColId = "";
  try {
    const col = $app.findCollectionByNameOrId("niif_asset_categories");
    categoriesColId = col.id;
    hasCategories = true;
  } catch (_) {}

  if (!hasCategories) {
    console.log("[GRAVY-ACTIVOS] Creando colección niif_asset_categories...");
    try {
      const fields = [
        { name: "code", type: "text", required: true },
        { name: "name", type: "text", required: true },
        { name: "useful_life_niif_default", type: "number", required: false },
        { name: "useful_life_fiscal_default", type: "number", required: false },
        { name: "depreciation_method_default", type: "select", required: false, values: ["linea_recta", "saldos_decrecientes", "unidades_produccion"] },
        { name: "residual_value_percent_default", type: "number", required: false },
        { name: "active", type: "bool", required: false }
      ];

      // Cuentas PUC relacionadas
      const p = (name) => {
        if (accountsColId) {
          fields.push({ name, type: "relation", required: false, collectionId: accountsColId, maxSelect: 1, cascadeDelete: false });
        } else {
          fields.push({ name, type: "text", required: false });
        }
      };
      p("account_asset_id");
      p("account_depr_accum_id");
      p("account_depr_expense_id");
      p("account_impairment_accum_id");
      p("account_impairment_expense_id");
      p("account_revaluation_id");
      p("account_disposal_gain_id");
      p("account_disposal_loss_id");

      const newCol = new Collection({
        name: "niif_asset_categories",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: fields,
        indexes: [
          "CREATE UNIQUE INDEX idx_nac_code ON niif_asset_categories (code)"
        ]
      });

      $app.save(newCol);
      categoriesColId = newCol.id;
      console.log("[GRAVY-ACTIVOS] Colección niif_asset_categories creada.");
    } catch (err) {
      console.error("[GRAVY-ACTIVOS] Error creando niif_asset_categories:", err);
    }
  }

  // 3. Extender niif_assets
  try {
    const niifAssets = $app.findCollectionByNameOrId("niif_assets");
    let needsSave = false;

    const addField = (name, type, extra = {}) => {
      if (!niifAssets.fields.getByName(name)) {
        niifAssets.fields.add(new Field({ name, type, required: false, ...extra }));
        needsSave = true;
      }
    };

    if (categoriesColId) {
      addField("category_id", "relation", { collectionId: categoriesColId, maxSelect: 1, cascadeDelete: false });
    }
    addField("parent_asset_id", "relation", { collectionId: niifAssets.id, maxSelect: 1, cascadeDelete: false });
    addField("status", "select", { values: ["active", "suspended", "in_repair", "retired", "sold", "lost", "obsolete"] });
    
    addField("brand", "text");
    addField("model", "text");
    addField("serial_number", "text");
    addField("color", "text");
    addField("manufacturer", "text");
    if (thirdPartiesColId) {
      addField("provider_id", "relation", { collectionId: thirdPartiesColId, maxSelect: 1, cascadeDelete: false });
    }
    addField("invoice_number", "text");
    addField("invoice_date", "text");
    addField("purchase_date", "text");
    addField("start_service_date", "text");
    addField("qr_code", "text");
    addField("photo_url", "text");

    if (needsSave) {
      $app.save(niifAssets);
      console.log("[GRAVY-ACTIVOS] Colección niif_assets extendida con campos adicionales.");
    }
  } catch (err) {
    console.error("[GRAVY-ACTIVOS] Error extendiendo niif_assets:", err);
  }

  // 4. Crear niif_asset_events (Historial/Kardex)
  let hasEvents = false;
  try {
    $app.findCollectionByNameOrId("niif_asset_events");
    hasEvents = true;
  } catch (_) {}

  if (!hasEvents) {
    console.log("[GRAVY-ACTIVOS] Creando colección niif_asset_events...");
    try {
      let assetsColId = "";
      try { assetsColId = $app.findCollectionByNameOrId("niif_assets").id; } catch (_) {}

      const fields = [
        { name: "date", type: "text", required: true },
        { name: "event_type", type: "select", required: true, values: ["traslado", "mejora", "revaluacion", "deterioro", "baja"] },
        { name: "description", type: "text", required: false },
        { name: "amount", type: "number", required: false },
        { name: "previous_value", type: "number", required: false },
        { name: "new_value", type: "number", required: false },
        { name: "location_from", type: "text", required: false },
        { name: "location_to", type: "text", required: false }
      ];

      if (assetsColId) {
        fields.push({ name: "asset_id", type: "relation", required: true, collectionId: assetsColId, maxSelect: 1, cascadeDelete: true });
      }
      if (costCentersColId) {
        fields.push({ name: "cost_center_from_id", type: "relation", required: false, collectionId: costCentersColId, maxSelect: 1, cascadeDelete: false });
        fields.push({ name: "cost_center_to_id", type: "relation", required: false, collectionId: costCentersColId, maxSelect: 1, cascadeDelete: false });
      }
      if (usersColId) {
        fields.push({ name: "owner_from_id", type: "relation", required: false, collectionId: usersColId, maxSelect: 1, cascadeDelete: false });
        fields.push({ name: "owner_to_id", type: "relation", required: false, collectionId: usersColId, maxSelect: 1, cascadeDelete: false });
      }
      if (transactionsColId) {
        fields.push({ name: "transaction_id", type: "relation", required: false, collectionId: transactionsColId, maxSelect: 1, cascadeDelete: false });
      }

      const newCol = new Collection({
        name: "niif_asset_events",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: fields
      });

      $app.save(newCol);
      console.log("[GRAVY-ACTIVOS] Colección niif_asset_events creada.");
    } catch (err) {
      console.error("[GRAVY-ACTIVOS] Error creando niif_asset_events:", err);
    }
  } else {
    // Extender campos relacionales a niif_asset_events si no existen
    try {
      const col = $app.findCollectionByNameOrId("niif_asset_events");
      let needsSave = false;
      const addField = (name, type, extra = {}) => {
        if (!col.fields.getByName(name)) {
          col.fields.add(new Field({ name, type, required: false, ...extra }));
          needsSave = true;
        }
      };

      if (costCentersColId) {
        addField("cost_center_from_id", "relation", { collectionId: costCentersColId, maxSelect: 1, cascadeDelete: false });
        addField("cost_center_to_id", "relation", { collectionId: costCentersColId, maxSelect: 1, cascadeDelete: false });
      }
      if (usersColId) {
        addField("owner_from_id", "relation", { collectionId: usersColId, maxSelect: 1, cascadeDelete: false });
        addField("owner_to_id", "relation", { collectionId: usersColId, maxSelect: 1, cascadeDelete: false });
      }
      if (transactionsColId) {
        addField("transaction_id", "relation", { collectionId: transactionsColId, maxSelect: 1, cascadeDelete: false });
      }

      if (needsSave) {
        $app.save(col);
        console.log("[GRAVY-ACTIVOS] Colección niif_asset_events extendida con relaciones faltantes.");
      }
    } catch (err) {
      console.error("[GRAVY-ACTIVOS] Error extendiendo niif_asset_events:", err);
    }
  }

  // 5. Crear niif_asset_inventories (Conciliación física)
  let hasInventories = false;
  try {
    $app.findCollectionByNameOrId("niif_asset_inventories");
    hasInventories = true;
  } catch (_) {}

  if (!hasInventories) {
    console.log("[GRAVY-ACTIVOS] Creando colección niif_asset_inventories...");
    try {
      const newCol = new Collection({
        name: "niif_asset_inventories",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: authRule,
        fields: [
          { name: "code", type: "text", required: true },
          { name: "date", type: "text", required: true },
          { name: "description", type: "text", required: false },
          { name: "status", type: "select", required: true, values: ["open", "closed"] },
          { name: "results", type: "json", required: false }
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_nai_code ON niif_asset_inventories (code)"
        ]
      });

      $app.save(newCol);
      console.log("[GRAVY-ACTIVOS] Colección niif_asset_inventories creada.");
    } catch (err) {
      console.error("[GRAVY-ACTIVOS] Error creando niif_asset_inventories:", err);
    }
  }
});
