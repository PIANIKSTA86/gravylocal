/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_ventas.pb.js
 * Módulos Comerciales: Facturación de Ventas y Turnos POS.
 * Crea colecciones e inicializa tipos de transacción contables.
 */

onBootstrap((e) => {
  e.next();

  let accountsId = "";
  let thirdPartiesId = "";
  let transactionsId = "";
  let txTypesId = "";
  let warehousesId = "";
  let productsId = "";
  let inventoryMovementsId = "";
  let usersId = "";

  try {
    accountsId = $app.findCollectionByNameOrId("accounts").id;
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    transactionsId = $app.findCollectionByNameOrId("transactions").id;
    txTypesId = $app.findCollectionByNameOrId("transaction_types").id;
    warehousesId = $app.findCollectionByNameOrId("warehouses").id;
    productsId = $app.findCollectionByNameOrId("products").id;
    inventoryMovementsId = $app.findCollectionByNameOrId("inventory_movements").id;
    usersId = $app.findCollectionByNameOrId("users").id;
  } catch (err) {
    console.log("[GRAVY-VENTAS] Error: no se pudieron obtener colecciones base: " + err);
    return;
  }

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";
  // Regla POS: cajero y vendedor pueden crear/actualizar turnos e invoices
  const posWriteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'cajero' || @request.auth.role = 'vendedor')";

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: pos_shifts (Turnos POS)
  // ──────────────────────────────────────────────────────────
  let posShiftsId = "";
  try {
    posShiftsId = $app.findCollectionByNameOrId("pos_shifts").id;
  } catch (_) {
    try {
      const posShifts = new Collection({
        name: "pos_shifts",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: posWriteRule,
        updateRule: posWriteRule,
        deleteRule: deleteRule,
        fields: [
          { name: "user_id", type: "relation", required: true, collectionId: usersId, cascadeDelete: false },
          { name: "opened_at", type: "text", required: true },
          { name: "closed_at", type: "text", required: false },
          { name: "cash_initial", type: "number", required: true, min: 0 },
          { name: "cash_sales", type: "number", required: false, min: 0 },
          { name: "cash_expected", type: "number", required: false, min: 0 },
          { name: "cash_actual", type: "number", required: false, min: 0 },
          { name: "status", type: "select", required: true, values: ["open", "closed"] },
          { name: "notes", type: "text", required: false }
        ]
      });
      $app.save(posShifts);
      posShiftsId = posShifts.id;
      console.log("[GRAVY-VENTAS] Colección pos_shifts creada.");
    } catch (err) {
      console.log("[GRAVY-VENTAS] Error al crear pos_shifts: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: invoices (Facturación Comercial y POS)
  // ──────────────────────────────────────────────────────────
  let invoicesId = "";
  try {
    invoicesId = $app.findCollectionByNameOrId("invoices").id;
  } catch (_) {
    try {
      if (!posShiftsId) {
        try { posShiftsId = $app.findCollectionByNameOrId("pos_shifts").id; } catch (_) {}
      }
      const invoices = new Collection({
        name: "invoices",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: posWriteRule,
        updateRule: posWriteRule,
        deleteRule: deleteRule,
        fields: [
          { name: "number", type: "text", required: true },
          { name: "customer_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false },
          { name: "warehouse_id", type: "relation", required: true, collectionId: warehousesId, cascadeDelete: false },
          { name: "date", type: "text", required: true },
          { name: "due_date", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "subtotal", type: "number", required: false, min: 0 },
          { name: "iva_total", type: "number", required: false, min: 0 },
          { name: "ret_total", type: "number", required: false, min: 0 },
          { name: "total", type: "number", required: false, min: 0 },
          { name: "payable_total", type: "number", required: false, min: 0 },
          { name: "payment_method", type: "select", required: true, values: ["EFECTIVO", "TRANSFERENCIA", "CREDITO"] },
          { name: "status", type: "select", required: true, values: ["draft", "posted", "voided"] },
          { name: "tx_type_id", type: "relation", required: false, collectionId: txTypesId, cascadeDelete: false },
          { name: "tx_number", type: "text", required: false },
          { name: "tx_id", type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false },
          { name: "inv_movement_id", type: "relation", required: false, collectionId: inventoryMovementsId, cascadeDelete: false },
          { name: "pos_shift_id", type: "relation", required: false, collectionId: posShiftsId, cascadeDelete: false }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_sales_inv_number ON invoices (number)"]
      });
      $app.save(invoices);
      invoicesId = invoices.id;
      console.log("[GRAVY-VENTAS] Colección invoices creada.");
    } catch (err) {
      console.log("[GRAVY-VENTAS] Error al crear invoices: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. COLECCIÓN: invoice_lines (Líneas de Factura Comercial/POS)
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("invoice_lines");
  } catch (_) {
    try {
      if (!invoicesId) {
        try { invoicesId = $app.findCollectionByNameOrId("invoices").id; } catch (_) {}
      }
      const invoiceLines = new Collection({
        name: "invoice_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "invoice_id", type: "relation", required: true, collectionId: invoicesId, cascadeDelete: true },
          { name: "line_order", type: "number", required: false },
          { name: "product_id", type: "relation", required: false, collectionId: productsId, cascadeDelete: false },
          { name: "account_id", type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
          { name: "description", type: "text", required: false },
          { name: "qty", type: "number", required: true, min: 0 },
          { name: "unit_price", type: "number", required: true, min: 0 },
          { name: "iva_rate", type: "number", required: false, min: 0 },
          { name: "iva_amount", type: "number", required: false, min: 0 },
          { name: "subtotal", type: "number", required: false, min: 0 },
          { name: "total", type: "number", required: false, min: 0 },
          { name: "discount_rate", type: "number", required: false, min: 0 },
          { name: "discount_pct", type: "number", required: false, min: 0 }
        ]
      });
      $app.save(invoiceLines);
      console.log("[GRAVY-VENTAS] Colección invoice_lines creada.");
    } catch (err) {
      console.log("[GRAVY-VENTAS] Error al crear invoice_lines: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 4. SEMBRAR TIPO DE TRANSACCIÓN: POS — Ventas POS
  // ──────────────────────────────────────────────────────────
  try {
    $app.findFirstRecordByFilter(
      "transaction_types",
      'code="POS" && prefix="POS"'
    );
  } catch (_) {
    try {
      const ttCol = $app.findCollectionByNameOrId("transaction_types");
      const posType = new Record(ttCol, {
        code: "POS",
        prefix: "POS",
        name: "Recibo de Venta POS",
        description: "Ventas directas en punto de venta (POS) y arqueos diarios",
        consecutive: 0,
        active: true
      });
      $app.save(posType);
      console.log("[GRAVY-VENTAS] Tipo de transacción POS creado.");
    } catch (err) {
      console.log("[GRAVY-VENTAS] Error al crear tipo de transacción POS: " + err);
    }
  }

  // ── Migración: campos de descuento, flete y pago mixto en invoices ──
  try {
    const invCol = $app.findCollectionByNameOrId("invoices");
    let changed = false;

    const existingFields = new Set(invCol.fields.fieldNames());
    if (!existingFields.has("discount_amount")) {
      invCol.fields.add(new NumberField({ name: "discount_amount", required: false, min: 0 }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo discount_amount agregado a invoices.");
    }
    if (!existingFields.has("freight_amount")) {
      invCol.fields.add(new NumberField({ name: "freight_amount", required: false, min: 0 }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo freight_amount agregado a invoices.");
    }
    if (!existingFields.has("payment_split")) {
      invCol.fields.add(new TextField({ name: "payment_split", required: false }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo payment_split agregado a invoices.");
    }
    if (!existingFields.has("bank_account_id")) {
      const bankAccountsId = $app.findCollectionByNameOrId("bank_accounts").id;
      invCol.fields.add(new RelationField({ name: "bank_account_id", required: false, collectionId: bankAccountsId, maxSelect: 1, cascadeDelete: false }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo bank_account_id agregado a invoices.");
    }

    const payMethodField = invCol.fields.getByName("payment_method");
    if (payMethodField && !payMethodField.values.includes("MIXTO")) {
      payMethodField.values.push("MIXTO");
      changed = true;
      console.log("[GRAVY-VENTAS] Valor MIXTO añadido a payment_method en invoices.");
    }

    if (changed) {
      $app.save(invCol);
    }
  } catch (err) {
    console.log("[GRAVY-VENTAS] Error al extender campos en invoices: " + err);
  }

  // ── Migración: campos de descuento en invoice_lines ──
  try {
    const lineCol = $app.findCollectionByNameOrId("invoice_lines");
    let changed = false;

    const existingFields = new Set(lineCol.fields.fieldNames());
    if (!existingFields.has("discount_rate")) {
      lineCol.fields.add(new NumberField({ name: "discount_rate", required: false, min: 0 }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo discount_rate agregado a invoice_lines.");
    }
    if (!existingFields.has("discount_pct")) {
      lineCol.fields.add(new NumberField({ name: "discount_pct", required: false, min: 0 }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo discount_pct agregado a invoice_lines.");
    }
    if (!existingFields.has("is_loss")) {
      lineCol.fields.add(new BoolField({ name: "is_loss", required: false }));
      changed = true;
      console.log("[GRAVY-VENTAS] Campo is_loss agregado a invoice_lines.");
    }

    if (changed) {
      $app.save(lineCol);
    }
  } catch (err) {
    console.log("[GRAVY-VENTAS] Error al extender campos en invoice_lines: " + err);
  }

  // Asegurar columna is_loss en la tabla física de SQLite
  try {
    $app.nonconcurrentDB()
      .newQuery("ALTER TABLE invoice_lines ADD COLUMN is_loss BOOLEAN DEFAULT 0")
      .execute();
  } catch (_) {}

  // Asegurar índice único en invoices de forma segura
  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_inv_number ON invoices (number)")
      .execute();
  } catch (err) {
    console.log("[GRAVY-VENTAS] Aviso al crear índice único en invoices: " + err);
  }

  console.log("[GRAVY-VENTAS] Migración de Ventas y POS completada.");
});

