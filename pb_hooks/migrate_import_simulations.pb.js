/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — migrate_import_simulations.pb.js
 * Migración para soporte de Simulador y Preliquidación de Costos de Importación.
 * Totalmente aislado de la contabilidad oficial y de las tablas operativas de importación.
 */

onBootstrap((e) => {
  e.next();

  let usersId = "";
  let productsId = "";

  try {
    usersId = $app.findCollectionByNameOrId("users").id;
  } catch (_) {}

  try {
    productsId = $app.findCollectionByNameOrId("products").id;
  } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: import_simulations
  // ──────────────────────────────────────────────────────────
  let simCol = null;
  let simColId = "";
  try {
    simCol = $app.findCollectionByNameOrId("import_simulations");
    simColId = simCol.id;
  } catch (_) {
    try {
      const fields = [
        { name: "code", type: "text", required: true },
        { name: "name", type: "text", required: true },
        { name: "status", type: "select", required: true, values: ["borrador", "estudio", "aprobada", "descartada"] },
        { name: "currency", type: "select", required: true, values: ["USD", "COP", "EUR", "CNY"] },
        { name: "exchange_rate", type: "number", required: true, min: 0.0001 },
        { name: "containers_count", type: "number", required: false, min: 0 },
        { name: "freight_per_container_usd", type: "number", required: false, min: 0 },
        { name: "origin_costs_per_container_usd", type: "number", required: false, min: 0 },
        { name: "insurance_rate", type: "number", required: false, min: 0 },
        { name: "insurance_fixed_usd", type: "number", required: false, min: 0 },
        { name: "itr_per_container_cop", type: "number", required: false, min: 0 },
        { name: "storage_per_container_cop", type: "number", required: false, min: 0 },
        { name: "inspection_per_bl_cop", type: "number", required: false, min: 0 },
        { name: "customs_agency_per_bl_cop", type: "number", required: false, min: 0 },
        { name: "other_local_costs_cop", type: "number", required: false, min: 0 },
        { name: "global_breakage_rate", type: "number", required: false, min: 0 },
        { name: "global_commission_rate", type: "number", required: false, min: 0 },
        { name: "notes", type: "text", required: false },
        { name: "summary_cache", type: "json", required: false },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
      ];

      if (usersId) {
        fields.push({
          name: "user_id",
          type: "relation",
          required: false,
          collectionId: usersId,
          maxSelect: 1,
          cascadeDelete: false
        });
      }

      const col = new Collection({
        name: "import_simulations",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: fields,
        indexes: ["CREATE UNIQUE INDEX IF NOT EXISTS idx_sim_code ON import_simulations (code)"]
      });

      $app.save(col);
      simCol = col;
      simColId = col.id;
      console.log("[GRAVY-PRELIQ] Colección import_simulations creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-PRELIQ] Error al crear import_simulations: " + err);
    }
  }

  // Asegurar campos created y updated en import_simulations si ya existía
  if (simCol) {
    try {
      const fieldNames = new Set(simCol.fields.fieldNames());
      let changed = false;
      if (!fieldNames.has("created")) {
        simCol.fields.add(new AutodateField({ name: "created", onCreate: true, onUpdate: false }));
        changed = true;
      }
      if (!fieldNames.has("updated")) {
        simCol.fields.add(new AutodateField({ name: "updated", onCreate: true, onUpdate: true }));
        changed = true;
      }
      if (changed) {
        $app.save(simCol);
        console.log("[GRAVY-PRELIQ] Campos created/updated agregados a import_simulations.");
      }
    } catch (err) {
      console.log("[GRAVY-PRELIQ] Aviso al extender import_simulations con autodate: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: import_simulation_lines
  // ──────────────────────────────────────────────────────────
  let linesCol = null;
  try {
    linesCol = $app.findCollectionByNameOrId("import_simulation_lines");
  } catch (_) {
    try {
      if (!simColId) {
        simColId = $app.findCollectionByNameOrId("import_simulations").id;
      }

      const fields = [
        { name: "simulation_id", type: "relation", required: true, collectionId: simColId, maxSelect: 1, cascadeDelete: true },
        { name: "product_type", type: "text", required: true },
        { name: "boxes_count", type: "number", required: false, min: 0 },
        { name: "unit_measure", type: "text", required: false },
        { name: "conversion_factor", type: "number", required: false, min: 0 },
        { name: "qty_base", type: "number", required: true, min: 0.0001 },
        { name: "fob_unit", type: "number", required: true, min: 0 },
        { name: "fob_total", type: "number", required: false, min: 0 },
        { name: "cost_distribution_pct", type: "number", required: false, min: 0 },
        { name: "landed_allocation_pct", type: "number", required: false, min: 0 },
        { name: "arancel_rate", type: "number", required: false, min: 0 },
        { name: "iva_rate", type: "number", required: false, min: 0 },
        { name: "breakage_rate", type: "number", required: false, min: 0 },
        { name: "commission_rate", type: "number", required: false, min: 0 },
        { name: "target_margin", type: "number", required: false, min: 0 },
        { name: "line_order", type: "number", required: false },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
      ];

      if (productsId) {
        fields.push({
          name: "product_id",
          type: "relation",
          required: false,
          collectionId: productsId,
          maxSelect: 1,
          cascadeDelete: false
        });
      }

      const col = new Collection({
        name: "import_simulation_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: fields,
        indexes: ["CREATE INDEX IF NOT EXISTS idx_sim_lines_sim ON import_simulation_lines (simulation_id)"]
      });

      $app.save(col);
      linesCol = col;
      console.log("[GRAVY-PRELIQ] Colección import_simulation_lines creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-PRELIQ] Error al crear import_simulation_lines: " + err);
    }
  }

  // Asegurar campos created y updated en import_simulation_lines si ya existía
  if (linesCol) {
    try {
      const fieldNames = new Set(linesCol.fields.fieldNames());
      let changed = false;
      if (!fieldNames.has("created")) {
        linesCol.fields.add(new AutodateField({ name: "created", onCreate: true, onUpdate: false }));
        changed = true;
      }
      if (!fieldNames.has("updated")) {
        linesCol.fields.add(new AutodateField({ name: "updated", onCreate: true, onUpdate: true }));
        changed = true;
      }
      if (changed) {
        $app.save(linesCol);
        console.log("[GRAVY-PRELIQ] Campos created/updated agregados a import_simulation_lines.");
      }
    } catch (err) {
      console.log("[GRAVY-PRELIQ] Aviso al extender import_simulation_lines con autodate: " + err);
    }
  }

  // Asegurar columnas SQLite directamente
  try { $app.db().newQuery("ALTER TABLE import_simulations ADD COLUMN created TEXT DEFAULT ''").execute(); } catch (_) {}
  try { $app.db().newQuery("ALTER TABLE import_simulations ADD COLUMN updated TEXT DEFAULT ''").execute(); } catch (_) {}
  try { $app.db().newQuery("ALTER TABLE import_simulation_lines ADD COLUMN created TEXT DEFAULT ''").execute(); } catch (_) {}
  try { $app.db().newQuery("ALTER TABLE import_simulation_lines ADD COLUMN updated TEXT DEFAULT ''").execute(); } catch (_) {}

  // Sembrar consecutivo inicial para preliquidaciones si no existe
  try {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    try {
      $app.findFirstRecordByFilter("settings", 'key="preliq_consecutive"');
    } catch (_) {
      const preliqConsecutive = new Record(settingsCol, { key: "preliq_consecutive", value: "0" });
      $app.save(preliqConsecutive);
      console.log("[GRAVY-PRELIQ] Semilla preliq_consecutive inicializada en 0.");
    }
  } catch (err) {
    console.log("[GRAVY-PRELIQ] Aviso al sembrar consecutivo preliq: " + err);
  }
});
