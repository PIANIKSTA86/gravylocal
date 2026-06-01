/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let usersId = "";
  let productsId = "";
  let purchaseInvoicesId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    usersId = $app.findCollectionByNameOrId("users").id;
    productsId = $app.findCollectionByNameOrId("products").id;
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Error: no se pudieron obtener colecciones base: " + err);
    return;
  }

  try {
    purchaseInvoicesId = $app.findCollectionByNameOrId("purchase_invoices").id;
  } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: imports
  // ──────────────────────────────────────────────────────────
  let importsId = "";
  try {
    importsId = $app.findCollectionByNameOrId("imports").id;
  } catch (_) {
    try {
      const col = new Collection({
        name: "imports",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "number", type: "text", required: true },
          { name: "supplier_id", type: "relation", required: true, collectionId: thirdPartiesId, maxSelect: 1, cascadeDelete: false },
          { name: "status", type: "select", required: true, values: ["planeacion", "transito", "nacionalizacion", "recibido", "anulado"] },
          { name: "incoterm", type: "select", required: false, values: ["FOB", "CIF", "EXW", "CFR", "CIP", "CPT", "DAP", "DPU", "DDP", "FAS", "FCA"] },
          { name: "bl_awb", type: "text", required: false },
          { name: "bl_document", type: "file", required: false, maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf", "image/*"] },
          { name: "transport_type", type: "select", required: false, values: ["maritimo", "aereo", "terrestre", "courier"] },
          { name: "estimated_arrival", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "currency", type: "select", required: true, values: ["USD", "COP", "EUR", "CNY"] },
          { name: "exchange_rate", type: "number", required: true, min: 0.0001 },
          { name: "fob_total", type: "number", required: false, min: 0 },
          { name: "freight_cost", type: "number", required: false, min: 0 },
          { name: "insurance_cost", type: "number", required: false, min: 0 },
          { name: "arancel_total", type: "number", required: false, min: 0 },
          { name: "gastos_nacionalizacion", type: "number", required: false, min: 0 },
          { name: "transporte_nacional", type: "number", required: false, min: 0 },
          { name: "otros_gastos", type: "number", required: false, min: 0 },
          { name: "total_gastos_cif", type: "number", required: false, min: 0 },
          { name: "total_gastos_locales", type: "number", required: false, min: 0 },
          { name: "total", type: "number", required: false, min: 0 },
          { name: "purchase_invoice_id", type: "relation", required: false, collectionId: purchaseInvoicesId, maxSelect: 1, cascadeDelete: false },
          { name: "date_created", type: "text", required: true },
          { name: "user_id", type: "relation", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: false }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_imports_number ON imports (number)"]
      });
      $app.save(col);
      importsId = col.id;
      console.log("[GRAVY-IMPORTACIONES] Colección imports creada.");
    } catch (err) {
      console.log("[GRAVY-IMPORTACIONES] Error al crear imports: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: import_lines
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("import_lines");
  } catch (_) {
    try {
      if (!importsId) {
        importsId = $app.findCollectionByNameOrId("imports").id;
      }
      const col = new Collection({
        name: "import_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "import_id", type: "relation", required: true, collectionId: importsId, maxSelect: 1, cascadeDelete: true },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, maxSelect: 1, cascadeDelete: false },
          { name: "qty", type: "number", required: true, min: 0.001 },
          { name: "fob_price", type: "number", required: true, min: 0 },
          { name: "arancel_rate", type: "number", required: false, min: 0 },
          { name: "arancel_amount", type: "number", required: false, min: 0 },
          { name: "iva_rate", type: "number", required: false, min: 0 },
          { name: "iva_amount", type: "number", required: false, min: 0 },
          { name: "prorated_cost", type: "number", required: false, min: 0 },
          { name: "unit_cost_cop", type: "number", required: false, min: 0 },
          { name: "total_cop", type: "number", required: false, min: 0 },
          { name: "manifest_number", type: "text", required: false },
          { name: "manifest_file", type: "file", required: false, maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf", "image/*"] },
          { name: "line_order", type: "number", required: false }
        ]
      });
      $app.save(col);
      console.log("[GRAVY-IMPORTACIONES] Colección import_lines creada.");
    } catch (err) {
      console.log("[GRAVY-IMPORTACIONES] Error al crear import_lines: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. EXTENDER colecciones existentes: sales_order_lines y purchase_invoices
  // ──────────────────────────────────────────────────────────
  try {
    if (!importsId) {
      importsId = $app.findCollectionByNameOrId("imports").id;
    }

    // 3a. Extender sales_order_lines
    try {
      const solCol = $app.findCollectionByNameOrId("sales_order_lines");
      const solFields = new Set(solCol.fields.fieldNames());
      if (!solFields.has("import_id")) {
        solCol.fields.add(new RelationField({
          name: "import_id",
          required: false,
          collectionId: importsId,
          cascadeDelete: false,
          maxSelect: 1
        }));
        $app.save(solCol);
        console.log("[GRAVY-IMPORTACIONES] Campo import_id agregado a sales_order_lines.");
      }
    } catch (err) {
      console.log("[GRAVY-IMPORTACIONES] Aviso al extender sales_order_lines: " + err);
    }

    // 3b. Extender purchase_invoices
    try {
      if (!purchaseInvoicesId) {
        try { purchaseInvoicesId = $app.findCollectionByNameOrId("purchase_invoices").id; } catch (_) {}
      }
      if (purchaseInvoicesId) {
        const piCol = $app.findCollectionByNameOrId("purchase_invoices");
        const piFields = new Set(piCol.fields.fieldNames());
        if (!piFields.has("import_id")) {
          piCol.fields.add(new RelationField({
            name: "import_id",
            required: false,
            collectionId: importsId,
            cascadeDelete: false,
            maxSelect: 1
          }));
          $app.save(piCol);
          console.log("[GRAVY-IMPORTACIONES] Campo import_id agregado a purchase_invoices.");
        }
      }
    } catch (err) {
      console.log("[GRAVY-IMPORTACIONES] Aviso al extender purchase_invoices: " + err);
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Error en extensión de colecciones: " + err);
  }

  // Sembrar número inicial consecutivo para importaciones
  try {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    try {
      $app.findFirstRecordByFilter("settings", 'key="import_consecutive"');
    } catch (_) {
      const importConsecutive = new Record(settingsCol, { key: "import_consecutive", value: "0" });
      $app.save(importConsecutive);
      console.log("[GRAVY-IMPORTACIONES] Semilla import_consecutive inicializada en 0.");
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Aviso al sembrar consecutivo de importaciones: " + err);
  }

  // Sincronizar divisa CNY en colecciones existentes
  try {
    const importsCol = $app.findCollectionByNameOrId("imports");
    const currencyField = importsCol.fields.getByName("currency");
    if (currencyField) {
      const currentValues = currencyField.values || [];
      if (!currentValues.includes("CNY")) {
        currentValues.push("CNY");
        currencyField.values = currentValues;
        $app.save(importsCol);
        console.log("[GRAVY-IMPORTACIONES] Divisa CNY agregada a la colección imports.");
      }
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Aviso al agregar divisa CNY a imports: " + err);
  }

  // Asegurar índices
  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_imports_number ON imports (number)")
      .execute();
  } catch (_) {}

  console.log("[GRAVY-IMPORTACIONES] Migración de importaciones completada.");
});
