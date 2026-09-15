/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — migrate_importaciones_consolidadas.pb.js
 * Migración para soporte de:
 * 1. Importaciones Consolidadas (Multi-Proveedor y Facturas Comerciales independientes)
 * 2. Trazabilidad de Lotes de Fabricación (inventory_lots)
 * 3. Palletizado Heterogéneo y Control WMS de Estibas (import_pallet_configs, inventory_pallets)
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let productsId = "";
  let warehousesId = "";
  let transactionsId = "";
  let importsId = "";
  let importLinesId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    productsId = $app.findCollectionByNameOrId("products").id;
    warehousesId = $app.findCollectionByNameOrId("warehouses").id;
  } catch (err) {
    console.log("[GRAVY-IMPORT-CONSOLIDADO] Aviso: colecciones base no disponibles: " + err);
    return;
  }

  try { transactionsId = $app.findCollectionByNameOrId("transactions").id; } catch (_) {}
  try { importsId = $app.findCollectionByNameOrId("imports").id; } catch (_) {}
  try { importLinesId = $app.findCollectionByNameOrId("import_lines").id; } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // 1. EXTENDER COLECCIÓN: imports
  // ──────────────────────────────────────────────────────────
  try {
    if (importsId) {
      const impCol = $app.findCollectionByNameOrId("imports");
      const impFieldNames = new Set(impCol.fields.fieldNames());
      let impChanged = false;

      // is_consolidated (bool)
      if (!impFieldNames.has("is_consolidated")) {
        impCol.fields.add(new BoolField({ name: "is_consolidated", required: false }));
        impChanged = true;
      }

      // forwarder_supplier_id (relation to third_parties)
      if (!impFieldNames.has("forwarder_supplier_id") && thirdPartiesId) {
        impCol.fields.add(new RelationField({
          name: "forwarder_supplier_id",
          required: false,
          collectionId: thirdPartiesId,
          cascadeDelete: false,
          maxSelect: 1
        }));
        impChanged = true;
      }

      // local_carrier_trm & local_other_trm (number)
      if (!impFieldNames.has("local_carrier_trm")) {
        impCol.fields.add(new NumberField({ name: "local_carrier_trm", required: false }));
        impChanged = true;
      }
      if (!impFieldNames.has("local_other_trm")) {
        impCol.fields.add(new NumberField({ name: "local_other_trm", required: false }));
        impChanged = true;
      }
      if (!impFieldNames.has("freight_exchange_rate")) {
        impCol.fields.add(new NumberField({ name: "freight_exchange_rate", required: false }));
        impChanged = true;
      }
      if (!impFieldNames.has("insurance_exchange_rate")) {
        impCol.fields.add(new NumberField({ name: "insurance_exchange_rate", required: false }));
        impChanged = true;
      }
      if (!impFieldNames.has("customs_exchange_rate")) {
        impCol.fields.add(new NumberField({ name: "customs_exchange_rate", required: false }));
        impChanged = true;
      }

      // Asegurar columnas SQLite
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN is_consolidated INTEGER DEFAULT 0").execute(); } catch (_) {}
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN forwarder_supplier_id TEXT DEFAULT ''").execute(); } catch (_) {}
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN local_carrier_trm REAL DEFAULT 0").execute(); } catch (_) {}
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN local_other_trm REAL DEFAULT 0").execute(); } catch (_) {}
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN freight_exchange_rate REAL DEFAULT 0").execute(); } catch (_) {}
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN insurance_exchange_rate REAL DEFAULT 0").execute(); } catch (_) {}
      try { $app.db().newQuery("ALTER TABLE imports ADD COLUMN customs_exchange_rate REAL DEFAULT 0").execute(); } catch (_) {}

      // supplier_id: asegurar que no sea estrictamente required si es consolidada
      const suppField = impCol.fields.getByName("supplier_id");
      if (suppField && suppField.required === true) {
        suppField.required = false;
        impChanged = true;
      }

      if (impChanged) {
        $app.save(impCol);
        console.log("[GRAVY-IMPORT-CONSOLIDADO] Colección 'imports' extendida con soporte consolidado.");
      }
    }
  } catch (err) {
    console.log("[GRAVY-IMPORT-CONSOLIDADO] Aviso al extender imports: " + err);
  }

  // ──────────────────────────────────────────────────────────
  // 2. NUEVA COLECCIÓN: import_invoices (Facturas Comerciales Proveedores)
  // ──────────────────────────────────────────────────────────
  let importInvoicesId = "";
  try {
    importInvoicesId = $app.findCollectionByNameOrId("import_invoices").id;
  } catch (_) {
    try {
      if (importsId && thirdPartiesId) {
        const fields = [
          { name: "import_id", type: "relation", required: true, collectionId: importsId, maxSelect: 1, cascadeDelete: true },
          { name: "supplier_id", type: "relation", required: true, collectionId: thirdPartiesId, maxSelect: 1, cascadeDelete: false },
          { name: "invoice_number", type: "text", required: true },
          { name: "invoice_date", type: "text", required: false },
          { name: "currency", type: "select", required: true, values: ["USD", "COP", "EUR", "CNY"] },
          { name: "exchange_rate", type: "number", required: false, min: 0.0001 },
          { name: "fob_amount", type: "number", required: false, min: 0 },
          { name: "fob_amount_cop", type: "number", required: false, min: 0 },
          { name: "payment_due_date", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "invoice_file", type: "file", required: false, maxSelect: 1, maxSize: 10485760, mimeTypes: ["application/pdf", "image/*"] },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ];

        if (transactionsId) {
          fields.push({ name: "tx_fob_id", type: "relation", required: false, collectionId: transactionsId, maxSelect: 1, cascadeDelete: false });
        }

        const col = new Collection({
          name: "import_invoices",
          type: "base",
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: fields,
          indexes: ["CREATE INDEX idx_imp_inv_import ON import_invoices (import_id)"]
        });
        $app.save(col);
        importInvoicesId = col.id;
        console.log("[GRAVY-IMPORT-CONSOLIDADO] Colección 'import_invoices' creada.");
      }
    } catch (err) {
      console.log("[GRAVY-IMPORT-CONSOLIDADO] Error al crear import_invoices: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. EXTENDER COLECCIÓN: import_lines
  // ──────────────────────────────────────────────────────────
  try {
    if (importLinesId) {
      const lineCol = $app.findCollectionByNameOrId("import_lines");
      const lineFieldNames = new Set(lineCol.fields.fieldNames());
      let lineChanged = false;

      // supplier_id
      if (!lineFieldNames.has("supplier_id") && thirdPartiesId) {
        lineCol.fields.add(new RelationField({
          name: "supplier_id",
          required: false,
          collectionId: thirdPartiesId,
          cascadeDelete: false,
          maxSelect: 1
        }));
        lineChanged = true;
      }

      // import_invoice_id
      if (!lineFieldNames.has("import_invoice_id") && importInvoicesId) {
        lineCol.fields.add(new RelationField({
          name: "import_invoice_id",
          required: false,
          collectionId: importInvoicesId,
          cascadeDelete: false,
          maxSelect: 1
        }));
        lineChanged = true;
      }

      // lot_number (Lote de fabricación)
      if (!lineFieldNames.has("lot_number")) {
        lineCol.fields.add(new TextField({ name: "lot_number", required: false }));
        lineChanged = true;
      }

      // manufacturing_date (Fecha fabricación)
      if (!lineFieldNames.has("manufacturing_date")) {
        lineCol.fields.add(new TextField({ name: "manufacturing_date", required: false }));
        lineChanged = true;
      }

      // expiry_date (Fecha vencimiento)
      if (!lineFieldNames.has("expiry_date")) {
        lineCol.fields.add(new TextField({ name: "expiry_date", required: false }));
        lineChanged = true;
      }

      if (lineChanged) {
        $app.save(lineCol);
        console.log("[GRAVY-IMPORT-CONSOLIDADO] Colección 'import_lines' extendida con soporte de lote y proveedor.");
      }
    }
  } catch (err) {
    console.log("[GRAVY-IMPORT-CONSOLIDADO] Aviso al extender import_lines: " + err);
  }

  // ──────────────────────────────────────────────────────────
  // 4. NUEVA COLECCIÓN: import_pallet_configs (Desglose de Estibas)
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("import_pallet_configs");
  } catch (_) {
    try {
      if (importsId && productsId) {
        const fields = [
          { name: "import_id", type: "relation", required: true, collectionId: importsId, maxSelect: 1, cascadeDelete: true },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, maxSelect: 1, cascadeDelete: false },
          { name: "pallet_qty", type: "number", required: true, min: 1 },
          { name: "boxes_per_pallet", type: "number", required: true, min: 1 },
          { name: "units_per_box", type: "number", required: true, min: 1 },
          { name: "total_boxes", type: "number", required: false, min: 0 },
          { name: "total_units", type: "number", required: false, min: 0 },
          { name: "pallet_type", type: "select", required: false, values: ["ESTANDAR_120x100", "EURO_120x80", "ESPECIAL", "PISO_SUELTO"] },
          { name: "height_cm", type: "number", required: false, min: 0 },
          { name: "gross_weight_kg", type: "number", required: false, min: 0 },
          { name: "lot_number", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ];

        if (importLinesId) {
          fields.splice(2, 0, { name: "import_line_id", type: "relation", required: false, collectionId: importLinesId, maxSelect: 1, cascadeDelete: true });
        }

        const col = new Collection({
          name: "import_pallet_configs",
          type: "base",
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: fields,
          indexes: ["CREATE INDEX idx_imp_pallet_cfg ON import_pallet_configs (import_id)"]
        });
        $app.save(col);
        console.log("[GRAVY-IMPORT-CONSOLIDADO] Colección 'import_pallet_configs' creada.");
      }
    } catch (err) {
      console.log("[GRAVY-IMPORT-CONSOLIDADO] Error al crear import_pallet_configs: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 5. NUEVA COLECCIÓN: inventory_lots (Saldos y Costos por Lote)
  // ──────────────────────────────────────────────────────────
  let inventoryLotsId = "";
  try {
    inventoryLotsId = $app.findCollectionByNameOrId("inventory_lots").id;
  } catch (_) {
    try {
      if (productsId && warehousesId) {
        const fields = [
          { name: "product_id", type: "relation", required: true, collectionId: productsId, maxSelect: 1, cascadeDelete: false },
          { name: "warehouse_id", type: "relation", required: true, collectionId: warehousesId, maxSelect: 1, cascadeDelete: false },
          { name: "lot_number", type: "text", required: true },
          { name: "manufacturing_date", type: "text", required: false },
          { name: "expiry_date", type: "text", required: false },
          { name: "initial_qty", type: "number", required: true, min: 0 },
          { name: "qty_on_hand", type: "number", required: true, min: 0 },
          { name: "unit_cost", type: "number", required: false, min: 0 },
          { name: "status", type: "select", required: true, values: ["active", "depleted", "quarantine", "expired"] },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ];

        if (importsId) {
          fields.push({ name: "import_id", type: "relation", required: false, collectionId: importsId, maxSelect: 1, cascadeDelete: false });
        }
        if (thirdPartiesId) {
          fields.push({ name: "supplier_id", type: "relation", required: false, collectionId: thirdPartiesId, maxSelect: 1, cascadeDelete: false });
        }

        const col = new Collection({
          name: "inventory_lots",
          type: "base",
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: fields,
          indexes: [
            "CREATE INDEX idx_inv_lots_prod_wh ON inventory_lots (product_id, warehouse_id)",
            "CREATE INDEX idx_inv_lots_number ON inventory_lots (lot_number)"
          ]
        });
        $app.save(col);
        inventoryLotsId = col.id;
        console.log("[GRAVY-IMPORT-CONSOLIDADO] Colección 'inventory_lots' creada.");
      }
    } catch (err) {
      console.log("[GRAVY-IMPORT-CONSOLIDADO] Error al crear inventory_lots: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 6. NUEVA COLECCIÓN: inventory_pallets (Estibas Físicas / WMS LPN)
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("inventory_pallets");
  } catch (_) {
    try {
      if (productsId && warehousesId) {
        const fields = [
          { name: "pallet_code", type: "text", required: true },
          { name: "warehouse_id", type: "relation", required: true, collectionId: warehousesId, maxSelect: 1, cascadeDelete: false },
          { name: "location_code", type: "text", required: false },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, maxSelect: 1, cascadeDelete: false },
          { name: "boxes_initial", type: "number", required: true, min: 0 },
          { name: "boxes_current", type: "number", required: true, min: 0 },
          { name: "units_per_box", type: "number", required: true, min: 1 },
          { name: "units_available", type: "number", required: false, min: 0 },
          { name: "pallet_type", type: "select", required: false, values: ["ESTANDAR_120x100", "EURO_120x80", "ESPECIAL", "PISO_SUELTO"] },
          { name: "height_cm", type: "number", required: false, min: 0 },
          { name: "gross_weight_kg", type: "number", required: false, min: 0 },
          { name: "status", type: "select", required: true, values: ["full", "partial", "depleted", "quarantine"] },
          { name: "notes", type: "text", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ];

        if (inventoryLotsId) {
          fields.splice(5, 0, { name: "lot_id", type: "relation", required: false, collectionId: inventoryLotsId, maxSelect: 1, cascadeDelete: false });
        }
        if (importsId) {
          fields.push({ name: "import_id", type: "relation", required: false, collectionId: importsId, maxSelect: 1, cascadeDelete: false });
        }

        const col = new Collection({
          name: "inventory_pallets",
          type: "base",
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: fields,
          indexes: [
            "CREATE UNIQUE INDEX idx_inv_pallet_code ON inventory_pallets (pallet_code)",
            "CREATE INDEX idx_inv_pallets_wh_prod ON inventory_pallets (warehouse_id, product_id)"
          ]
        });
        $app.save(col);
        console.log("[GRAVY-IMPORT-CONSOLIDADO] Colección 'inventory_pallets' creada.");
      }
    } catch (err) {
      console.log("[GRAVY-IMPORT-CONSOLIDADO] Error al crear inventory_pallets: " + err);
    }
  }

  console.log("[GRAVY-IMPORT-CONSOLIDADO] Migración de importaciones consolidadas completada con éxito.");
});
