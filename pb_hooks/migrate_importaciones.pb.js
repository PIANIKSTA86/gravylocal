/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let usersId = "";
  let productsId = "";
  let purchaseInvoicesId = "";
  let transactionsId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    usersId = $app.findCollectionByNameOrId("users").id;
    productsId = $app.findCollectionByNameOrId("products").id;
    transactionsId = $app.findCollectionByNameOrId("transactions").id;
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

  // 3c. Extender imports con campos de causaciones por etapas
  try {
    const impCol = $app.findCollectionByNameOrId("imports");
    const impFields = new Set(impCol.fields.fieldNames());
    let needsSaveImp = false;

    // Campos de relación de transacción
    const txFields = [
      "tx_fob_id",
      "tx_freight_id",
      "tx_insurance_id",
      "tx_customs_id",
      "tx_local_carrier_id",
      "tx_local_other_id"
    ];
    for (const f of txFields) {
      if (!impFields.has(f) && transactionsId) {
        impCol.fields.add(new RelationField({
          name: f,
          required: false,
          collectionId: transactionsId,
          cascadeDelete: false,
          maxSelect: 1
        }));
        needsSaveImp = true;
      }
    }

    // Campos de relación de proveedor (tercero)
    const supplierFields = [
      { name: "freight_supplier_id", col: thirdPartiesId },
      { name: "insurance_supplier_id", col: thirdPartiesId },
      { name: "customs_supplier_id", col: thirdPartiesId },
      { name: "local_carrier_id", col: thirdPartiesId },
      { name: "local_other_supplier_id", col: thirdPartiesId }
    ];
    for (const f of supplierFields) {
      if (!impFields.has(f.name) && f.col) {
        impCol.fields.add(new RelationField({
          name: f.name,
          required: false,
          collectionId: f.col,
          cascadeDelete: false,
          maxSelect: 1
        }));
        needsSaveImp = true;
      }
    }

    // Campos de número de factura (text)
    const invoiceFields = [
      "supplier_invoice_num",
      "freight_invoice_num",
      "insurance_invoice_num",
      "customs_invoice_num",
      "local_carrier_invoice_num",
      "local_other_invoice_num"
    ];
    for (const f of invoiceFields) {
      if (!impFields.has(f)) {
        impCol.fields.add(new Field({
          name: f,
          type: "text",
          required: false
        }));
        needsSaveImp = true;
      }
    }

    if (needsSaveImp) {
      $app.save(impCol);
      console.log("[GRAVY-IMPORTACIONES] Campos de etapas y causaciones agregados a imports.");
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Error al extender imports: " + err);
  }

  // ──────────────────────────────────────────────────────────
  // 4. EXTENDER productos con campos de cumplimiento aduanero
  // ──────────────────────────────────────────────────────────
  try {
    const prodCol = $app.findCollectionByNameOrId("products");
    const prodFields = new Set(prodCol.fields.fieldNames());
    let needsSaveProd = false;

    if (!prodFields.has("posicion_arancelaria")) {
      prodCol.fields.add(new TextField({ name: "posicion_arancelaria", required: false }));
      needsSaveProd = true;
    }
    if (!prodFields.has("arancel_rate_default")) {
      prodCol.fields.add(new NumberField({ name: "arancel_rate_default", required: false, min: 0 }));
      needsSaveProd = true;
    }
    if (!prodFields.has("pais_origen")) {
      prodCol.fields.add(new TextField({ name: "pais_origen", required: false }));
      needsSaveProd = true;
    }
    if (!prodFields.has("marca")) {
      prodCol.fields.add(new TextField({ name: "marca", required: false }));
      needsSaveProd = true;
    }
    if (!prodFields.has("modelo")) {
      prodCol.fields.add(new TextField({ name: "modelo", required: false }));
      needsSaveProd = true;
    }
    if (!prodFields.has("visto_bueno_required")) {
      prodCol.fields.add(new BoolField({ name: "visto_bueno_required", required: false }));
      needsSaveProd = true;
    }
    if (!prodFields.has("visto_bueno_entidad")) {
      prodCol.fields.add(new SelectField({
        name: "visto_bueno_entidad",
        required: false,
        values: ["ICA", "INVIMA", "SIC", "INDUMIL", "AUNAP", "MINCIT", "OTRO"]
      }));
      needsSaveProd = true;
    }
    if (!prodFields.has("registro_sanitario")) {
      prodCol.fields.add(new TextField({ name: "registro_sanitario", required: false }));
      needsSaveProd = true;
    }
    if (!prodFields.has("peso_neto")) {
      prodCol.fields.add(new NumberField({ name: "peso_neto", required: false, min: 0 }));
      needsSaveProd = true;
    }
    if (!prodFields.has("peso_bruto")) {
      prodCol.fields.add(new NumberField({ name: "peso_bruto", required: false, min: 0 }));
      needsSaveProd = true;
    }

    if (needsSaveProd) {
      $app.save(prodCol);
      console.log("[GRAVY-IMPORTACIONES] Campos aduaneros agregados a la colección products.");
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Error al extender products: " + err);
  }

  // ──────────────────────────────────────────────────────────
  // 5. EXTENDER imports con campos DIAN/VUCE y prorrateo
  // ──────────────────────────────────────────────────────────
  try {
    const impCol = $app.findCollectionByNameOrId("imports");
    const impFields = new Set(impCol.fields.fieldNames());
    let needsSaveImp2 = false;

    if (!impFields.has("vuce_registro_num")) {
      impCol.fields.add(new TextField({ name: "vuce_registro_num", required: false }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("dian_declaracion_num")) {
      impCol.fields.add(new TextField({ name: "dian_declaracion_num", required: false }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("dian_declaracion_date")) {
      impCol.fields.add(new TextField({ name: "dian_declaracion_date", required: false }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("dian_levante_date")) {
      impCol.fields.add(new TextField({ name: "dian_levante_date", required: false }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("dian_trm")) {
      impCol.fields.add(new NumberField({ name: "dian_trm", required: false, min: 0 }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("modalidad_importacion")) {
      impCol.fields.add(new SelectField({
        name: "modalidad_importacion",
        required: false,
        values: ["ORDINARIA", "FRANQUICIA", "TEMPORAL_REEXP", "TEMPORAL_PERF", "ENSAMBLE", "URGENTES"]
      }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("canal_inspeccion")) {
      impCol.fields.add(new SelectField({
        name: "canal_inspeccion",
        required: false,
        values: ["AUTOMATICO", "DOCUMENTAL", "FISICO", "NO_INTRUSIVO"]
      }));
      needsSaveImp2 = true;
    }
    if (!impFields.has("proration_method")) {
      impCol.fields.add(new SelectField({
        name: "proration_method",
        required: false,
        values: ["FOB_VALUE", "GROSS_WEIGHT"]
      }));
      needsSaveImp2 = true;
    }

    if (needsSaveImp2) {
      $app.save(impCol);
      console.log("[GRAVY-IMPORTACIONES] Campos de aduanas DIAN/VUCE y prorrateo agregados a imports.");
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Error al extender imports (aduanas): " + err);
  }

  // ──────────────────────────────────────────────────────────
  // 6. EXTENDER import_lines con campos por línea
  // ──────────────────────────────────────────────────────────
  try {
    const lineCol = $app.findCollectionByNameOrId("import_lines");
    const lineFields = new Set(lineCol.fields.fieldNames());
    let needsSaveLine = false;

    if (!lineFields.has("pais_origen")) {
      lineCol.fields.add(new TextField({ name: "pais_origen", required: false }));
      needsSaveLine = true;
    }
    if (!lineFields.has("certificado_origen_num")) {
      lineCol.fields.add(new TextField({ name: "certificado_origen_num", required: false }));
      needsSaveLine = true;
    }
    if (!lineFields.has("posicion_arancelaria")) {
      lineCol.fields.add(new TextField({ name: "posicion_arancelaria", required: false }));
      needsSaveLine = true;
    }
    if (!lineFields.has("peso_neto_total")) {
      lineCol.fields.add(new NumberField({ name: "peso_neto_total", required: false, min: 0 }));
      needsSaveLine = true;
    }
    if (!lineFields.has("peso_bruto_total")) {
      lineCol.fields.add(new NumberField({ name: "peso_bruto_total", required: false, min: 0 }));
      needsSaveLine = true;
    }

    if (needsSaveLine) {
      $app.save(lineCol);
      console.log("[GRAVY-IMPORTACIONES] Campos aduaneros y de peso agregados a import_lines.");
    }
  } catch (err) {
    console.log("[GRAVY-IMPORTACIONES] Error al extender import_lines: " + err);
  }

  // Asegurar índices
  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_imports_number ON imports (number)")
      .execute();
  } catch (_) {}

  console.log("[GRAVY-IMPORTACIONES] Migración de importaciones completada.");
});
