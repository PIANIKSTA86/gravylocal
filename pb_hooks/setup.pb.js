/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — Setup inicial
 * Se ejecuta una sola vez al primer arranque de PocketBase.
 * IMPORTANTE: collectionId en campos de relación debe ser el ID real,
 * no el nombre de la colección.
 */

onBootstrap((e) => {
  e.next();

  // Evitar re-ejecución si ya existe la colección principal
  try {
    $app.findCollectionByNameOrId("settings");
    return; // Ya inicializado
  } catch (_) {
    // Primera vez — continuar
  }

  console.log("[GRAVY] Primer arranque detectado. Inicializando base de datos...");

  // ── ID de la colección de usuarios (built-in) ──────────
  let usersColId = "";
  try {
    usersColId = $app.findCollectionByNameOrId("users").id;
  } catch (_) {
    try { usersColId = $app.findCollectionByNameOrId("_pb_users_auth_").id; } catch (_2) {}
  }

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: settings
  // ─────────────────────────────────────────────────────────
  const settings = new Collection({
    name: "settings",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    updateRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    deleteRule: null,
    fields: [
      { name: "key",   type: "text", required: true },
      { name: "value", type: "text", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_settings_key ON settings (key)"],
  });
  $app.save(settings);

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: account_types
  // ─────────────────────────────────────────────────────────
  const accountTypes = new Collection({
    name: "account_types",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    updateRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    deleteRule: null,
    fields: [
      { name: "code",       type: "text",   required: true },
      { name: "name",       type: "text",   required: true },
      { name: "nature",     type: "select", required: true, values: ["debit","credit"] },
      { name: "class_code", type: "text",   required: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_at_code ON account_types (code)"],
  });
  $app.save(accountTypes);
  const accountTypesId = accountTypes.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: accounts — sin auto-referencia de padre
  //   Se usa parent_code (text) para evitar el problema chicken-and-egg
  // ─────────────────────────────────────────────────────────
  const accounts = new Collection({
    name: "accounts",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "code",                 type: "text",     required: true },
      { name: "name",                 type: "text",     required: true },
      { name: "account_type_id",      type: "relation", required: true,
        collectionId: accountTypesId, cascadeDelete: false },
      { name: "nature",               type: "select",   required: true,  values: ["debit","credit"] },
      { name: "level",                type: "number",   required: true,  min: 1, max: 6 },
      { name: "parent_code",          type: "text",     required: false },
      { name: "requires_third_party", type: "bool",     required: false },
      { name: "maneja_cruce",         type: "bool",     required: false },
      { name: "maneja_retenciones",   type: "bool",     required: false },
      { name: "tipos_retencion",      type: "text",     required: false },
      { name: "ret_rate_reterenta",   type: "number",   required: false, min: 0 },
      { name: "ret_rate_reteiva",     type: "number",   required: false, min: 0 },
      { name: "ret_rate_reteica",     type: "number",   required: false, min: 0 },
      { name: "active",               type: "bool",     required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_accounts_code ON accounts (code)"],
  });
  $app.save(accounts);
  const accountsId = accounts.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: third_parties
  // ─────────────────────────────────────────────────────────
  const thirdParties = new Collection({
    name: "third_parties",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    fields: [
      { name: "type",               type: "select",  required: true,  values: ["CLIENTE","PROVEEDOR","EMPLEADO","PROPIETARIO","ACREEDOR","TRANSPORTISTA","OTRO"] },
      { name: "doc_type",           type: "select",  required: true,  values: ["NIT","CC","CE","TI","PAS","RC"] },
      { name: "doc_number",         type: "text",    required: true },
      { name: "dv",                 type: "text",    required: false },
      { name: "name",               type: "text",    required: true },
      { name: "commercial_name",    type: "text",    required: false },
      { name: "email",              type: "email",   required: false },
      { name: "phone",              type: "text",    required: false },
      { name: "address",            type: "text",    required: false },
      { name: "city",               type: "text",    required: false },
      { name: "department",         type: "text",    required: false },
      { name: "country",            type: "text",    required: false },
      { name: "tax_regime",         type: "select",  required: false, values: ["COMUN","SIMPLIFICADO","NO_RESP","GRAN_CONTR"] },
      { name: "is_retention_agent", type: "bool",    required: false },
      { name: "bank_name",          type: "text",    required: false },
      { name: "bank_account",       type: "text",    required: false },
      { name: "contact_name",       type: "text",    required: false },
      { name: "contact_phone",      type: "text",    required: false },
      { name: "notes",              type: "text",    required: false },
      { name: "active",             type: "bool",    required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tp_doc ON third_parties (doc_type, doc_number)"],
  });
  $app.save(thirdParties);
  const thirdPartiesId = thirdParties.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: transaction_types
  // ─────────────────────────────────────────────────────────
  const transactionTypes = new Collection({
    name: "transaction_types",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    updateRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "code",        type: "text",   required: true },
      { name: "prefix",      type: "text",   required: true },
      { name: "name",        type: "text",   required: true },
      { name: "description", type: "text",   required: false },
      { name: "consecutive", type: "number", required: false, min: 0 },
      { name: "active",      type: "bool",   required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tt_code_prefix ON transaction_types (code, prefix)"],
  });
  $app.save(transactionTypes);
  const transactionTypesId = transactionTypes.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: transactions
  // ─────────────────────────────────────────────────────────
  const txFields = [
    { name: "tx_type_id",    type: "relation", required: true,  collectionId: transactionTypesId, cascadeDelete: false },
    { name: "number",        type: "text",     required: true },
    { name: "date",          type: "text",     required: true },
    { name: "description",   type: "text",     required: false },
    { name: "third_party_id",type: "relation", required: false, collectionId: thirdPartiesId, cascadeDelete: false },
    { name: "cross_enabled", type: "bool",     required: false },
    { name: "cross_type",    type: "text",     required: false },
    { name: "cross_number",  type: "text",     required: false },
    { name: "cross_amount",  type: "number",   required: false },
    { name: "cross_purpose", type: "select",   required: false, values: ["Causar","Recaudar","Reportar Cartera"] },
    { name: "status",        type: "select",   required: false, values: ["active","voided","draft"] },
  ];
  if (usersColId) {
    txFields.push({ name: "user_id", type: "relation", required: false, collectionId: usersColId, cascadeDelete: false });
  } else {
    txFields.push({ name: "user_id", type: "text", required: false });
  }
  const transactions = new Collection({
    name: "transactions",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: txFields,
    indexes: ["CREATE UNIQUE INDEX idx_transactions_number ON transactions (number)"],
  });
  $app.save(transactions);
  const transactionsId = transactions.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: tx_lines
  // ─────────────────────────────────────────────────────────
  const txLines = new Collection({
    name: "tx_lines",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "tx_id",      type: "relation", required: true,  collectionId: transactionsId, cascadeDelete: true },
      { name: "account_id", type: "relation", required: true,  collectionId: accountsId,     cascadeDelete: false },
      { name: "third_party_id", type: "relation", required: false, collectionId: thirdPartiesId, cascadeDelete: false },
      { name: "debit",      type: "number",   required: false, min: 0 },
      { name: "credit",     type: "number",   required: false, min: 0 },
      { name: "description",type: "text",     required: false },
      { name: "line_order", type: "number",   required: false },
    ],
  });
  $app.save(txLines);
  const txLinesId = txLines.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: audit_log
  // ─────────────────────────────────────────────────────────
  const auditFields = [
    { name: "username",  type: "text", required: true },
    { name: "action",    type: "text", required: true },
    { name: "entity",    type: "text", required: true },
    { name: "entity_id", type: "text", required: false },
    { name: "event_at",  type: "text", required: false },
    { name: "details",   type: "text", required: false },
    { name: "ip",        type: "text", required: false },
  ];
  if (usersColId) {
    auditFields.unshift({ name: "user_id", type: "relation", required: false, collectionId: usersColId, cascadeDelete: false });
  } else {
    auditFields.unshift({ name: "user_id", type: "text", required: false });
  }
  const auditLog = new Collection({
    name: "audit_log",
    type: "base",
    listRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'auditor')",
    viewRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'auditor')",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: null,
    fields: auditFields,
  });
  $app.save(auditLog);

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: bank_accounts
  // ─────────────────────────────────────────────────────────
  const bankAccounts = new Collection({
    name: "bank_accounts",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "name",       type: "text",     required: true },
      { name: "bank",       type: "text",     required: true },
      { name: "number",     type: "text",     required: true },
      { name: "account_id", type: "relation", required: true, collectionId: accountsId, cascadeDelete: false },
      { name: "currency",   type: "text",     required: false },
      { name: "active",     type: "bool",     required: false },
    ],
  });
  $app.save(bankAccounts);
  const bankAccountsId = bankAccounts.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: bank_movements
  // ─────────────────────────────────────────────────────────
  const bankMovements = new Collection({
    name: "bank_movements",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    fields: [
      { name: "bank_account_id", type: "relation", required: true,  collectionId: bankAccountsId, cascadeDelete: false },
      { name: "date",            type: "text",     required: true },
      { name: "description",     type: "text",     required: false },
      { name: "debit",           type: "number",   required: false, min: 0 },
      { name: "credit",          type: "number",   required: false, min: 0 },
      { name: "balance",         type: "number",   required: false },
      { name: "ref",             type: "text",     required: false },
      { name: "reconciled",      type: "bool",     required: false },
      { name: "tx_line_id",      type: "relation", required: false, collectionId: txLinesId, cascadeDelete: false },
    ],
  });
  $app.save(bankMovements);

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: payroll_periods
  // ─────────────────────────────────────────────────────────
  const payrollPeriods = new Collection({
    name: "payroll_periods",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "name",      type: "text",     required: true },
      { name: "date_from", type: "text",     required: true },
      { name: "date_to",   type: "text",     required: true },
      { name: "status",    type: "select",   required: false, values: ["draft","approved","paid"] },
      { name: "tx_id",     type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false },
    ],
  });
  $app.save(payrollPeriods);
  const payrollPeriodsId = payrollPeriods.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: payroll_lines
  // ─────────────────────────────────────────────────────────
  const payrollLines = new Collection({
    name: "payroll_lines",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    fields: [
      { name: "period_id",           type: "relation", required: true,  collectionId: payrollPeriodsId, cascadeDelete: true },
      { name: "employee_id",         type: "relation", required: true,  collectionId: thirdPartiesId,   cascadeDelete: false },
      { name: "salary_base",         type: "number",   required: true,  min: 0 },
      { name: "days_worked",         type: "number",   required: false, min: 0, max: 30 },
      { name: "overtime",            type: "number",   required: false, min: 0 },
      { name: "transport_allowance", type: "number",   required: false, min: 0 },
      { name: "deduction_health",    type: "number",   required: false, min: 0 },
      { name: "deduction_pension",   type: "number",   required: false, min: 0 },
      { name: "deduction_other",     type: "number",   required: false, min: 0 },
      { name: "net_pay",             type: "number",   required: false, min: 0 },
      { name: "employer_health",     type: "number",   required: false, min: 0 },
      { name: "employer_pension",    type: "number",   required: false, min: 0 },
      { name: "employer_arl",        type: "number",   required: false, min: 0 },
      { name: "sena",                type: "number",   required: false, min: 0 },
      { name: "icbf",                type: "number",   required: false, min: 0 },
      { name: "caja_comp",           type: "number",   required: false, min: 0 },
      { name: "cesantias",           type: "number",   required: false, min: 0 },
      { name: "intereses_ces",       type: "number",   required: false, min: 0 },
      { name: "prima",               type: "number",   required: false, min: 0 },
      { name: "vacaciones",          type: "number",   required: false, min: 0 },
      { name: "notes",               type: "text",     required: false },
    ],
  });
  $app.save(payrollLines);

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: einvoice_docs
  // ─────────────────────────────────────────────────────────
  const einvoiceDocs = new Collection({
    name: "einvoice_docs",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: null,
    fields: [
      { name: "tx_id",         type: "relation", required: true,  collectionId: transactionsId, cascadeDelete: false },
      { name: "cufe",          type: "text",     required: false },
      { name: "status",        type: "select",   required: false, values: ["pendiente","enviada","aceptada","rechazada"] },
      { name: "dian_response", type: "text",     required: false },
      { name: "xml_content",   type: "text",     required: false },
      { name: "sent_at",       type: "text",     required: false },
    ],
  });
  $app.save(einvoiceDocs);

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: products
  // ─────────────────────────────────────────────────────────
  const productsCol = new Collection({
    name: "products",
    type: "base",
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "code",                  type: "text",     required: true  },
      { name: "name",                  type: "text",     required: true  },
      { name: "description",           type: "text",     required: false },
      { name: "type",                  type: "select",   required: true,  values: ["BIEN","SERVICIO"] },
      { name: "unit",                  type: "text",     required: true  },
      { name: "unspsc_code",           type: "text",     required: false },
      { name: "ean_code",              type: "text",     required: false },
      { name: "presentacion",          type: "text",     required: false },
      { name: "categoria",             type: "text",     required: false },
      { name: "linea",                 type: "text",     required: false },
      { name: "iva_rate",              type: "number",   required: true,  min: 0 },
      { name: "income_account_id",     type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
      { name: "cost_account_id",       type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
      { name: "inventory_account_id",  type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
      { name: "base_price",            type: "number",   required: false, min: 0 },
      { name: "precio_venta_2",        type: "number",   required: false, min: 0 },
      { name: "precio_venta_3",        type: "number",   required: false, min: 0 },
      { name: "cost_price",            type: "number",   required: false, min: 0 },
      { name: "peso",                  type: "number",   required: false, min: 0 },
      { name: "cajas_en_pallet",       type: "number",   required: false, min: 0 },
      { name: "und_empaque",           type: "number",   required: false, min: 0 },
      { name: "peso_x_und_empaque",    type: "number",   required: false, min: 0 },
      { name: "active",                type: "bool",     required: false },
    ],
  });
  $app.save(productsCol);
  const productsId = productsCol.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: warehouses (bodegas / almacenes)
  // ─────────────────────────────────────────────────────────
  const warehouses = new Collection({
    name: "warehouses",
    type: "base",
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "code",       type: "text",     required: true  },
      { name: "name",       type: "text",     required: true  },
      { name: "address",    type: "text",     required: false },
      { name: "notes",      type: "text",     required: false },
      { name: "active",     type: "bool",     required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_warehouses_code ON warehouses (code)"],
  });
  $app.save(warehouses);
  const warehousesId = warehouses.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: inventory_movements (documento de movimiento)
  // Tipos: ENTRADA, SALIDA, TRASLADO, AJUSTE_POSITIVO, AJUSTE_NEGATIVO
  // ─────────────────────────────────────────────────────────
  const inventoryMovements = new Collection({
    name: "inventory_movements",
    type: "base",
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "number",         type: "text",     required: true  },
      { name: "mov_type",       type: "select",   required: true,
        values: ["ENTRADA","SALIDA","TRASLADO","AJUSTE_POSITIVO","AJUSTE_NEGATIVO"] },
      { name: "date",           type: "text",     required: true  },
      { name: "warehouse_id",   type: "relation", required: true,  collectionId: warehousesId, cascadeDelete: false },
      { name: "dest_warehouse_id", type: "relation", required: false, collectionId: warehousesId, cascadeDelete: false },
      { name: "third_party_id", type: "relation", required: false, collectionId: thirdPartiesId, cascadeDelete: false },
      { name: "notes",          type: "text",     required: false },
      { name: "status",         type: "select",   required: false, values: ["draft","applied","voided"] },
      { name: "tx_id",          type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_invmov_number ON inventory_movements (number)"],
  });
  $app.save(inventoryMovements);
  const inventoryMovementsId = inventoryMovements.id;

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: inventory_movement_lines
  // ─────────────────────────────────────────────────────────
  const inventoryMovementLines = new Collection({
    name: "inventory_movement_lines",
    type: "base",
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "movement_id",  type: "relation", required: true,  collectionId: inventoryMovementsId, cascadeDelete: true  },
      { name: "product_id",   type: "relation", required: true,  collectionId: productsId,            cascadeDelete: false },
      { name: "qty",          type: "number",   required: true,  min: 0 },
      { name: "unit_cost",    type: "number",   required: false, min: 0 },
      { name: "notes",        type: "text",     required: false },
      { name: "line_order",   type: "number",   required: false },
    ],
  });
  $app.save(inventoryMovementLines);

  // ─────────────────────────────────────────────────────────
  // COLECCIÓN: inventory_stock (stock actual por producto+bodega)
  // Mantiene un único registro por combinación producto+bodega.
  // Se actualiza cuando se aplica un movimiento.
  // ─────────────────────────────────────────────────────────
  const inventoryStock = new Collection({
    name: "inventory_stock",
    type: "base",
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
    deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
    fields: [
      { name: "product_id",   type: "relation", required: true,  collectionId: productsId,    cascadeDelete: false },
      { name: "warehouse_id", type: "relation", required: true,  collectionId: warehousesId,  cascadeDelete: false },
      { name: "qty_on_hand",  type: "number",   required: false, min: 0 },
      { name: "avg_cost",     type: "number",   required: false, min: 0 },
      { name: "last_mov_date",type: "text",     required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_inv_stock_prod_wh ON inventory_stock (product_id, warehouse_id)"],
  });
  $app.save(inventoryStock);

  // ─────────────────────────────────────────────────────────
  // EXTENDER USUARIOS con campos de rol
  // PocketBase v0.23+ requiere constructores tipados para fields.add()
  // ─────────────────────────────────────────────────────────
  try {
    const usersCol = $app.findCollectionByNameOrId("users");
    const existing = new Set(usersCol.fields.fieldNames());
    if (!existing.has('role')) {
      usersCol.fields.add(new SelectField({
        name: "role",
        required: true,
        values: ["admin","contador","auxiliar","auditor","viewer"],
      }));
    }
    if (!existing.has('full_name')) {
      usersCol.fields.add(new TextField({
        name: "full_name",
        required: true,
      }));
    }
    if (!existing.has('active')) {
      usersCol.fields.add(new BoolField({
        name: "active",
        required: false,
      }));
    }
    if (!existing.has('owner_id')) {
      const thirdPartiesCol = $app.findCollectionByNameOrId('third_parties');
      usersCol.fields.add(new Field({
        name: 'owner_id',
        type: 'relation',
        required: false,
        collectionId: thirdPartiesCol.id,
        cascadeDelete: false,
      }));
    }
    $app.save(usersCol);
    console.log("[GRAVY] Campos extendidos de users verificados correctamente.");
  } catch(err) {
    console.log("[GRAVY] Aviso al extender users: " + err);
    console.log("[GRAVY] Agregue manualmente los campos role/full_name/active/owner_id a la coleccion users en el panel admin.");
  }

  // ─────────────────────────────────────────────────────────
  // DATOS SEMILLA
  // ─────────────────────────────────────────────────────────

  // Configuración empresa
  const settingsCol2 = $app.findCollectionByNameOrId("settings");
  const seedSettings = [
    ["company_name",    "Mi Empresa S.A.S."],
    ["company_nit",     "900.123.456-7"],
    ["company_address", "Cra 10 # 5-30, Bogotá"],
    ["company_phone",   "601-555-0100"],
    ["company_email",   "info@miempresa.com"],
    ["smv_year",        String(new Date().getFullYear())],
  ];
  for (const [k, v] of seedSettings) {
    const r = new Record(settingsCol2, { key: k, value: v });
    $app.save(r);
  }

  // Tipos de cuenta (PUC Colombia)
  const atCol  = $app.findCollectionByNameOrId("account_types");
  const atSeed = [
    ["ACT","Activo","debit","1"],
    ["PAS","Pasivo","credit","2"],
    ["PAT","Patrimonio","credit","3"],
    ["ING","Ingreso","credit","4"],
    ["GAS","Gasto","debit","5"],
    ["COS","Costo de Ventas","debit","6"],
    ["CON","Contrapartida","credit","7"],
  ];
  const atIds = {};
  for (const [code, name, nature, cls] of atSeed) {
    const r = new Record(atCol, { code, name, nature, class_code: cls });
    $app.save(r);
    atIds[code] = r.id;
  }

  // Tipos de transacción
  const ttCol  = $app.findCollectionByNameOrId("transaction_types");
  const ttSeed = [
    ["FV","FV","Factura de Venta","Facturación de ventas a clientes",0],
    ["FC","FC","Factura de Compra","Registro de compras a proveedores",0],
    ["RC","RC","Recibo de Caja","Ingresos de efectivo",0],
    ["EG","EG","Egreso de Caja","Pagos en efectivo",0],
    ["NC","NC","Nota Crédito","Nota crédito a clientes",0],
    ["ND","ND","Nota Débito","Nota débito a clientes",0],
    ["CM","CM","Comprobante de Egreso","Pagos a proveedores",0],
    ["NM","NM","Nómina","Liquidación de nómina",0],
  ];
  for (const [code, prefix, name, description, consecutive] of ttSeed) {
    const r = new Record(ttCol, { code, prefix, name, description, consecutive, active: true });
    $app.save(r);
  }

  // Plan de Cuentas PUC Colombia — extracto representativo
  const acCol = $app.findCollectionByNameOrId("accounts");
  // [code, name, atCode, nature, level, parentCode, requiresThirdParty]
  const acSeed = [
    // Clase 1 — Activo
    ["1","ACTIVO","ACT","debit",1,"",false],
    ["11","DISPONIBLE","ACT","debit",2,"1",false],
    ["1105","CAJA","ACT","debit",3,"11",false],
    ["110505","CAJA GENERAL","ACT","debit",4,"1105",false],
    ["110510","CAJAS MENORES","ACT","debit",4,"1105",false],
    ["1110","BANCOS","ACT","debit",3,"11",false],
    ["111005","BANCO NACIONAL MONEDA NAL","ACT","debit",4,"1110",false],
    ["12","INVERSIONES","ACT","debit",2,"1",false],
    ["1205","ACCIONES","ACT","debit",3,"12",false],
    ["13","DEUDORES","ACT","debit",2,"1",true],
    ["1305","CLIENTES","ACT","debit",3,"13",true],
    ["130505","NACIONALES","ACT","debit",4,"1305",true],
    ["1330","ANTICIPOS Y AVANCES","ACT","debit",3,"13",true],
    ["133005","A PROVEEDORES","ACT","debit",4,"1330",true],
    ["1355","ANTICIPO DE IMPUESTOS","ACT","debit",3,"13",false],
    ["135505","RETENCIÓN EN LA FUENTE","ACT","debit",4,"1355",false],
    ["135510","ICA RETENIDO","ACT","debit",4,"1355",false],
    ["14","INVENTARIOS","ACT","debit",2,"1",false],
    ["1405","MATERIAS PRIMAS","ACT","debit",3,"14",false],
    ["1430","PRODUCTOS TERMINADOS","ACT","debit",3,"14",false],
    ["15","PROPIEDADES PLANTA Y EQUIPO","ACT","debit",2,"1",false],
    ["1524","EQUIPO DE OFICINA","ACT","debit",3,"15",false],
    ["152405","MUEBLES Y ENSERES","ACT","debit",4,"1524",false],
    ["1528","EQUIPO DE COMPUTACIÓN","ACT","debit",3,"15",false],
    ["152805","COMPUTADORES","ACT","debit",4,"1528",false],
    ["1592","DEPRECIACIÓN ACUMULADA","ACT","credit",3,"15",false],
    // Clase 2 — Pasivo
    ["2","PASIVO","PAS","credit",1,"",false],
    ["21","OBLIGACIONES FINANCIERAS","PAS","credit",2,"2",false],
    ["2105","BANCOS NACIONALES","PAS","credit",3,"21",false],
    ["22","PROVEEDORES","PAS","credit",2,"2",true],
    ["2205","NACIONALES","PAS","credit",3,"22",true],
    ["220505","CUENTAS POR PAGAR PROVEEDORES","PAS","credit",4,"2205",true],
    ["23","CUENTAS POR PAGAR","PAS","credit",2,"2",true],
    ["2330","RETENCIONES EN LA FUENTE","PAS","credit",3,"23",false],
    ["233005","RENTA","PAS","credit",4,"2330",false],
    ["233010","IVA RÉGIMEN COMÚN","PAS","credit",4,"2330",false],
    ["2335","IVA IMPUESTO POR PAGAR","PAS","credit",3,"23",false],
    ["233501","IVA GENERADO","PAS","credit",4,"2335",false],
    ["233502","IVA DESCONTABLE","PAS","debit",4,"2335",false],
    ["24","IMPUESTOS GRAVÁMENES Y TASAS","PAS","credit",2,"2",false],
    ["2404","IVA","PAS","credit",3,"24",false],
    ["2408","ICA","PAS","credit",3,"24",false],
    ["25","OBLIGACIONES LABORALES","PAS","credit",2,"2",true],
    ["2505","SALARIOS POR PAGAR","PAS","credit",3,"25",true],
    ["2510","CESANTÍAS CONSOLIDADAS","PAS","credit",3,"25",false],
    ["2515","INTERESES SOBRE CESANTÍAS","PAS","credit",3,"25",false],
    ["2520","PRIMA DE SERVICIOS","PAS","credit",3,"25",false],
    ["2525","VACACIONES CONSOLIDADAS","PAS","credit",3,"25",false],
    // Clase 3 — Patrimonio
    ["3","PATRIMONIO","PAT","credit",1,"",false],
    ["31","CAPITAL SOCIAL","PAT","credit",2,"3",false],
    ["3105","CAPITAL SUSCRITO Y PAGADO","PAT","credit",3,"31",false],
    ["33","RESERVAS","PAT","credit",2,"3",false],
    ["3305","RESERVA LEGAL","PAT","credit",3,"33",false],
    ["36","RESULTADOS DEL EJERCICIO","PAT","credit",2,"3",false],
    ["3605","UTILIDAD DEL EJERCICIO","PAT","credit",3,"36",false],
    ["3610","PÉRDIDA DEL EJERCICIO","PAT","debit",3,"36",false],
    ["37","RESULTADOS DE EJERCICIOS ANTERIORES","PAT","credit",2,"3",false],
    ["3705","UTILIDADES ACUMULADAS","PAT","credit",3,"37",false],
    // Clase 4 — Ingresos
    ["4","INGRESOS","ING","credit",1,"",false],
    ["41","OPERACIONALES","ING","credit",2,"4",false],
    ["4135","COMERCIO AL POR MAYOR Y MENOR","ING","credit",3,"41",false],
    ["413505","VENTAS BRUTAS","ING","credit",4,"4135",false],
    ["42","NO OPERACIONALES","ING","credit",2,"4",false],
    ["4210","FINANCIEROS","ING","credit",3,"42",false],
    ["4245","DEVOLUCIONES EN VENTAS","ING","debit",3,"42",false],
    // Clase 5 — Gastos
    ["5","GASTOS","GAS","debit",1,"",false],
    ["51","OPERACIONALES DE ADMINISTRACIÓN","GAS","debit",2,"5",false],
    ["5105","GASTOS DE PERSONAL","GAS","debit",3,"51",false],
    ["510506","SUELDOS","GAS","debit",4,"5105",false],
    ["510527","AUXILIO DE TRANSPORTE","GAS","debit",4,"5105",false],
    ["5110","HONORARIOS","GAS","debit",3,"51",false],
    ["5135","SERVICIOS","GAS","debit",3,"51",false],
    ["513540","GASTOS BANCARIOS","GAS","debit",4,"5135",false],
    ["5155","DEPRECIACIONES","GAS","debit",3,"51",false],
    ["5195","GASTOS DIVERSOS","GAS","debit",3,"51",false],
    ["52","OPERACIONALES DE VENTAS","GAS","debit",2,"5",false],
    ["5245","PUBLICIDAD Y PROPAGANDA","GAS","debit",3,"52",false],
    // Clase 6 — Costo de Ventas
    ["6","COSTOS","COS","debit",1,"",false],
    ["61","COSTO DE VENTAS","COS","debit",2,"6",false],
    ["6135","COSTO DE VENTAS COMERC.","COS","debit",3,"61",false],
    ["613505","COSTO MERCANCÍA VENDIDA","COS","debit",4,"6135",false],
    // Clase 7 — Costos de Producción
    ["7","COSTOS DE PRODUCCIÓN","CON","credit",1,"",false],
    ["71","MATERIA PRIMA","CON","debit",2,"7",false],
    ["72","MANO DE OBRA DIRECTA","CON","debit",2,"7",false],
    ["73","COSTOS INDIRECTOS","CON","debit",2,"7",false],
  ];

  for (const [code, name, atCode, nature, level, parentCode, req3rd] of acSeed) {
    const r = new Record(acCol, {
      code,
      name,
      account_type_id: atIds[atCode],
      nature,
      level,
      parent_code: parentCode,
      requires_third_party: req3rd,
      active: true,
    });
    $app.save(r);
  }

  console.log("[GRAVY] Base de datos inicializada correctamente.");
  console.log("[GRAVY] Ir a http://localhost:8090/_/ para crear el primer usuario administrador.");
});

/**
 * Asigna número consecutivo en servidor para transactions.
 *
 * Esto evita depender de incrementos en cliente y centraliza
 * la numeración por tipo de transacción.
 */
onRecordCreateRequest((e) => {
  const rec = e.record;
  if (!rec) {
    e.next();
    return;
  }

  // Solo aplica a la colección transactions
  const colName = String(rec.collection?.()?.name || rec.collectionName || "");
  if (colName !== "transactions") {
    e.next();
    return;
  }

  // En algunos contextos de JSVM la relación puede llegar como string o array.
  const rawTxType = rec.get("tx_type_id");
  const txTypeId = String(Array.isArray(rawTxType) ? (rawTxType[0] || "") : (rawTxType || "")).trim();
  if (!txTypeId) {
    throw new BadRequestError("tx_type_id es obligatorio para generar consecutivo");
  }

  let txNumber = "";

  try {
    $app.runInTransaction((txApp) => {
      const txType = txApp.findRecordById("transaction_types", txTypeId);
      const prefix = String(txType.getString("prefix") || txType.getString("code") || "TX").trim().toUpperCase() || "TX";
      const consecutiveRaw = Number(txType.get("consecutive") || 0);
      const next = (Number.isFinite(consecutiveRaw) ? consecutiveRaw : 0) + 1;

      txType.set("consecutive", next);
      txApp.save(txType);

      txNumber = `${prefix}-${String(next).padStart(8, "0")}`;
    });
  } catch (err) {
    throw new BadRequestError("No se pudo generar consecutivo de transaccion: " + err);
  }

  if (!txNumber) {
    throw new BadRequestError("No se pudo asignar numero consecutivo");
  }

  rec.set("number", txNumber);
  e.next();
}, "transactions");

// Garantiza el índice único en instalaciones existentes.
onBootstrap((e) => {
  e.next();

  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_number ON transactions (number)")
      .execute();
  } catch (err) {
    console.log("[GRAVY] Aviso al crear índice idx_transactions_number: " + err);
  }
});

// -----------------------------------------------------------------------------
// Auditoría server-side (fuente confiable)
// -----------------------------------------------------------------------------
function getActorInfoFromEvent(e) {
  const auth = e?.requestInfo?.auth;
  if (!auth) {
    return { userId: "", username: "system" };
  }

  const userId = String(auth.id || "");
  const username = String(auth.getString?.("email") || auth.getString?.("username") || auth.getString?.("name") || userId || "system");
  return { userId, username };
}

function writeAuditFromEvent(e, action, entity, entityId = "", details = "") {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_log");
    const actor = getActorInfoFromEvent(e);
    const remoteIp = (typeof e?.remoteIP === "function")
      ? String(e.remoteIP() || "")
      : String(e?.remoteIP || "");

    const payload = {
      username: actor.username,
      action: String(action || ""),
      entity: String(entity || ""),
      entity_id: String(entityId || ""),
      event_at: (new Date()).toISOString().replace("T", " ").slice(0, 19),
      details: String(details || ""),
      ip: remoteIp,
    };

    if (actor.userId) payload.user_id = actor.userId;

    const log = new Record(auditCol, payload);
    $app.save(log);
  } catch (err) {
    // Evitar romper la operación principal por un fallo de auditoría.
    console.log("[GRAVY][Audit] Error al guardar auditoria: " + err);
  }
}

onBootstrap((e) => {
  e.next();

  try {
    const auditCol = $app.findCollectionByNameOrId("audit_log");
    const expectedCreateRule = null;
    let hasEventAt = false;
    let changed = false;

    try {
      hasEventAt = !!auditCol.fields.getByName("event_at");
    } catch (_) {
      hasEventAt = String(auditCol.fields || "").includes("event_at");
    }

    if (!hasEventAt) {
      auditCol.fields.add(new TextField({
        name: "event_at",
        required: false,
      }));
      console.log("[GRAVY] Campo event_at agregado a audit_log.");
      changed = true;
    }

    if (auditCol.createRule !== null) {
      auditCol.createRule = null;
      console.log("[GRAVY] Regla createRule de audit_log restringida a null (solo server-side).");
      changed = true;
    }

    if (changed) {
      $app.save(auditCol);
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al asegurar campo event_at en audit_log: " + err);
  }
});

function getRecordCollectionName(e) {
  try {
    const r = e?.record;
    if (r?.collection?.()) {
      const c = r.collection();
      if (c?.name) return String(c.name);
    }
    if (r?.collectionName) return String(r.collectionName);
    if (e?.collection?.name) return String(e.collection.name);
  } catch (_) {}
  return "";
}

const AUDIT_ENTITY_LABELS = {
  accounts: "Cuenta",
  third_parties: "Tercero",
  transaction_types: "Tipo Tx",
  transactions: "Transaccion",
  tx_lines: "Linea Tx",
  bank_accounts: "Cuenta Bancaria",
  bank_movements: "Movimiento Bancario",
  payroll_periods: "Periodo Nomina",
  payroll_lines: "Linea Nomina",
  einvoice_docs: "DIAN Doc",
};

const AUDIT_TARGET_COLLECTIONS = Object.keys(AUDIT_ENTITY_LABELS);

AUDIT_TARGET_COLLECTIONS.forEach((collectionName) => {
  onRecordCreateRequest((e) => {
    e.next();
    try {
      const r = e.record;
      if (r) {
        const colName = getRecordCollectionName(e);
        const label = AUDIT_ENTITY_LABELS[colName] || AUDIT_ENTITY_LABELS[collectionName];
        if (label) {
          writeAuditFromEvent(e, "CREATE", label, r.id, `Creado ${label}`);
        }
      }
    } catch (_) {
      // Nunca bloquear la operación principal por auditoría.
    }
  }, collectionName);

  onRecordUpdateRequest((e) => {
    e.next();
    try {
      const r = e.record;
      if (r) {
        const colName = getRecordCollectionName(e);
        const label = AUDIT_ENTITY_LABELS[colName] || AUDIT_ENTITY_LABELS[collectionName];
        if (label) {
          writeAuditFromEvent(e, "UPDATE", label, r.id, `Actualizado ${label}`);
        }
      }
    } catch (_) {
      // Nunca bloquear la operación principal por auditoría.
    }
  }, collectionName);

  onRecordDeleteRequest((e) => {
    const beforeId = String(e?.record?.id || "");
    e.next();
    try {
      const r = e.record;
      const colName = getRecordCollectionName(e);
      const label = AUDIT_ENTITY_LABELS[colName] || AUDIT_ENTITY_LABELS[collectionName];
      if (label) {
        writeAuditFromEvent(e, "DELETE", label, beforeId || String(r?.id || ""), `Eliminado ${label}`);
      }
    } catch (_) {
      // Nunca bloquear la operación principal por auditoría.
    }
  }, collectionName);
});

// Asegura reglas de acceso de users en instalaciones ya existentes.
onBootstrap((e) => {
  e.next();

  try {
    const usersCol = $app.findCollectionByNameOrId("users");
    const listRule = "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'";
    const viewRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.id = id)";
    const updateRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.id = id)";

    let changed = false;
    if (usersCol.listRule !== listRule) {
      usersCol.listRule = listRule;
      changed = true;
    }
    if (usersCol.viewRule !== viewRule) {
      usersCol.viewRule = viewRule;
      changed = true;
    }
    if (usersCol.updateRule !== updateRule) {
      usersCol.updateRule = updateRule;
      changed = true;
    }

    if (changed) {
      $app.save(usersCol);
      console.log("[GRAVY] Reglas de users actualizadas.");
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al ajustar reglas de users: " + err);
  }
});

// ── Migración: payment_days en transactions y third_parties ──────────────────
onBootstrap((e) => {
  e.next();

  try {
    const txCol = $app.findCollectionByNameOrId("transactions");
    let hasPd = false;
    try { hasPd = !!txCol.fields.getByName("payment_days"); } catch (_) { hasPd = String(txCol.fields || "").includes("payment_days"); }
    if (!hasPd) {
      txCol.fields.add(new NumberField({ name: "payment_days", required: false, min: 0 }));
      $app.save(txCol);
      console.log("[GRAVY] Campo payment_days agregado a transactions.");
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al migrar transactions (payment_days): " + err);
  }

  try {
    const tpCol = $app.findCollectionByNameOrId("third_parties");
    let hasPd = false;
    try { hasPd = !!tpCol.fields.getByName("payment_days"); } catch (_) { hasPd = String(tpCol.fields || "").includes("payment_days"); }
    if (!hasPd) {
      tpCol.fields.add(new NumberField({ name: "payment_days", required: false, min: 0 }));
      $app.save(tpCol);
      console.log("[GRAVY] Campo payment_days agregado a third_parties.");
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al migrar third_parties (payment_days): " + err);
  }
});

// ── Migración: campos de cruce y retenciones ──────────────────────────────────
onBootstrap((e) => {
  e.next();

  // ── accounts: cruce/retenciones + tarifas por tipo ───────────────────────
  try {
    const col = $app.findCollectionByNameOrId("accounts");
    let changed = false;

    const boolFields = ["maneja_cruce", "maneja_retenciones"];
    for (const fname of boolFields) {
      let hasIt = false;
      try { hasIt = !!col.fields.getByName(fname); } catch (_) { hasIt = String(col.fields || "").includes(fname); }
      if (!hasIt) {
        col.fields.add(new BoolField({ name: fname, required: false }));
        changed = true;
        console.log("[GRAVY] Campo " + fname + " agregado a accounts.");
      }
    }

    let hasTipos = false;
    try { hasTipos = !!col.fields.getByName("tipos_retencion"); } catch (_) { hasTipos = String(col.fields || "").includes("tipos_retencion"); }
    if (!hasTipos) {
      col.fields.add(new TextField({ name: "tipos_retencion", required: false }));
      changed = true;
      console.log("[GRAVY] Campo tipos_retencion agregado a accounts.");
    }

    const rateFields = ["ret_rate_reterenta", "ret_rate_reteiva", "ret_rate_reteica"];
    for (const fname of rateFields) {
      let hasIt = false;
      try { hasIt = !!col.fields.getByName(fname); } catch (_) { hasIt = String(col.fields || "").includes(fname); }
      if (!hasIt) {
        col.fields.add(new NumberField({ name: fname, required: false, min: 0 }));
        changed = true;
        console.log("[GRAVY] Campo " + fname + " agregado a accounts.");
      }
    }

    if (changed) $app.save(col);
  } catch (err) {
    console.log("[GRAVY] Aviso al migrar accounts (cruce/retenciones): " + err);
  }

  // ── tx_lines: cross_doc_ref ───────────────────────────────────────────────
  try {
    const col = $app.findCollectionByNameOrId("tx_lines");
    let hasCross = false;
    try { hasCross = !!col.fields.getByName("cross_doc_ref"); } catch (_) { hasCross = String(col.fields || "").includes("cross_doc_ref"); }
    if (!hasCross) {
      col.fields.add(new TextField({ name: "cross_doc_ref", required: false }));
      $app.save(col);
      console.log("[GRAVY] Campo cross_doc_ref agregado a tx_lines.");
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al migrar tx_lines (cross_doc_ref): " + err);
  }
});

// ── Migración: colección products ─────────────────────────────────────────────
onBootstrap((e) => {
  e.next();

  try {
    $app.findCollectionByNameOrId("products");
    // Ya existe — verificar campos opcionales
    return;
  } catch (_) {
    // No existe, crearla
  }

  try {
    const accountsId = $app.findCollectionByNameOrId("accounts").id;

    const col = new Collection({
      name: "products",
      type: "base",
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: "code",                 type: "text",     required: true  },
        { name: "name",                 type: "text",     required: true  },
        { name: "description",          type: "text",     required: false },
        { name: "type",                 type: "select",   required: true,  values: ["BIEN","SERVICIO"] },
        { name: "unit",                 type: "text",     required: true  },
        { name: "unspsc_code",          type: "text",     required: false },
        { name: "ean_code",             type: "text",     required: false },
        { name: "presentacion",         type: "text",     required: false },
        { name: "categoria",            type: "text",     required: false },
        { name: "linea",                type: "text",     required: false },
        { name: "iva_rate",             type: "number",   required: true,  min: 0 },
        { name: "income_account_id",    type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
        { name: "cost_account_id",      type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
        { name: "inventory_account_id", type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
        { name: "base_price",           type: "number",   required: false, min: 0 },
        { name: "precio_venta_2",       type: "number",   required: false, min: 0 },
        { name: "precio_venta_3",       type: "number",   required: false, min: 0 },
        { name: "cost_price",           type: "number",   required: false, min: 0 },
        { name: "peso",                 type: "number",   required: false, min: 0 },
        { name: "cajas_en_pallet",      type: "number",   required: false, min: 0 },
        { name: "und_empaque",          type: "number",   required: false, min: 0 },
        { name: "peso_x_und_empaque",   type: "number",   required: false, min: 0 },
        { name: "active",               type: "bool",     required: false },
      ],
    });
    $app.save(col);
    console.log("[GRAVY] Colección products creada correctamente.");
  } catch (err) {
    console.log("[GRAVY] Error al crear colección products: " + err);
  }
});

// ── Migración: campos opcionales en products (idempotente) ───────────────────
onBootstrap((e) => {
  e.next();

  try {
    const col = $app.findCollectionByNameOrId("products");
    let changed = false;

    const textFields = ["presentacion", "categoria", "linea"];
    for (const fname of textFields) {
      let hasIt = false;
      try { hasIt = !!col.fields.getByName(fname); } catch (_) { hasIt = String(col.fields || "").includes(fname); }
      if (!hasIt) {
        col.fields.add(new TextField({ name: fname, required: false }));
        changed = true;
        console.log("[GRAVY] Campo " + fname + " agregado a products.");
      }
    }

    const numberFields = [
      "precio_venta_2",
      "precio_venta_3",
      "peso",
      "cajas_en_pallet",
      "und_empaque",
      "peso_x_und_empaque",
    ];
    for (const fname of numberFields) {
      let hasIt = false;
      try { hasIt = !!col.fields.getByName(fname); } catch (_) { hasIt = String(col.fields || "").includes(fname); }
      if (!hasIt) {
        col.fields.add(new NumberField({ name: fname, required: false, min: 0 }));
        changed = true;
        console.log("[GRAVY] Campo " + fname + " agregado a products.");
      }
    }

    if (changed) {
      $app.save(col);
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al migrar campos opcionales de products: " + err);
  }
});

// ── Migración F5: Inventarios ─────────────────────────────────────────────────
onBootstrap((e) => {
  e.next();

  // warehouses
  try {
    $app.findCollectionByNameOrId("warehouses");
  } catch (_) {
    try {
      const col = new Collection({
        name: "warehouses",
        type: "base",
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "code",    type: "text", required: true  },
          { name: "name",    type: "text", required: true  },
          { name: "address", type: "text", required: false },
          { name: "notes",   type: "text", required: false },
          { name: "active",  type: "bool", required: false },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_warehouses_code ON warehouses (code)"],
      });
      $app.save(col);
      console.log("[GRAVY] Colección warehouses creada (migración).");
    } catch (err2) {
      console.log("[GRAVY] Error creando warehouses: " + err2);
    }
  }

  // inventory_movements + inventory_movement_lines + inventory_stock
  try {
    const productsId    = $app.findCollectionByNameOrId("products").id;
    const warehousesId  = $app.findCollectionByNameOrId("warehouses").id;
    const thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    const transactionsId = $app.findCollectionByNameOrId("transactions").id;

    // inventory_movements
    let invMovId;
    try {
      invMovId = $app.findCollectionByNameOrId("inventory_movements").id;
    } catch (_) {
      const col = new Collection({
        name: "inventory_movements",
        type: "base",
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "number",            type: "text",     required: true  },
          { name: "mov_type",          type: "select",   required: true,
            values: ["ENTRADA","SALIDA","TRASLADO","AJUSTE_POSITIVO","AJUSTE_NEGATIVO"] },
          { name: "date",              type: "text",     required: true  },
          { name: "warehouse_id",      type: "relation", required: true,  collectionId: warehousesId,   cascadeDelete: false },
          { name: "dest_warehouse_id", type: "relation", required: false, collectionId: warehousesId,   cascadeDelete: false },
          { name: "third_party_id",    type: "relation", required: false, collectionId: thirdPartiesId, cascadeDelete: false },
          { name: "notes",             type: "text",     required: false },
          { name: "status",            type: "select",   required: false, values: ["draft","applied","voided"] },
          { name: "tx_id",             type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_invmov_number ON inventory_movements (number)"],
      });
      $app.save(col);
      invMovId = col.id;
      console.log("[GRAVY] Colección inventory_movements creada (migración).");
    }

    // inventory_movement_lines
    try {
      $app.findCollectionByNameOrId("inventory_movement_lines");
    } catch (_) {
      const col = new Collection({
        name: "inventory_movement_lines",
        type: "base",
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "movement_id", type: "relation", required: true,  collectionId: invMovId,      cascadeDelete: true  },
          { name: "product_id",  type: "relation", required: true,  collectionId: productsId,    cascadeDelete: false },
          { name: "qty",         type: "number",   required: true,  min: 0 },
          { name: "unit_cost",   type: "number",   required: false, min: 0 },
          { name: "notes",       type: "text",     required: false },
          { name: "line_order",  type: "number",   required: false },
        ],
      });
      $app.save(col);
      console.log("[GRAVY] Colección inventory_movement_lines creada (migración).");
    }

    // inventory_stock
    try {
      $app.findCollectionByNameOrId("inventory_stock");
    } catch (_) {
      const col = new Collection({
        name: "inventory_stock",
        type: "base",
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "product_id",    type: "relation", required: true, collectionId: productsId,   cascadeDelete: false },
          { name: "warehouse_id",  type: "relation", required: true, collectionId: warehousesId, cascadeDelete: false },
          { name: "qty_on_hand",   type: "number",   required: false, min: 0 },
          { name: "avg_cost",      type: "number",   required: false, min: 0 },
          { name: "last_mov_date", type: "text",     required: false },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_inv_stock_prod_wh ON inventory_stock (product_id, warehouse_id)"],
      });
      $app.save(col);
      console.log("[GRAVY] Colección inventory_stock creada (migración).");
    }

  } catch (err) {
    console.log("[GRAVY] Aviso migrando colecciones de inventario: " + err);
  }
});

// ── Migración Compras: purchase_invoices + purchase_invoice_lines ─────────────
onBootstrap((e) => {
  e.next();

  try {
    const productsId     = $app.findCollectionByNameOrId("products").id;
    const warehousesId   = $app.findCollectionByNameOrId("warehouses").id;
    const thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    const transactionsId = $app.findCollectionByNameOrId("transactions").id;
    const txTypesId      = $app.findCollectionByNameOrId("transaction_types").id;
    const accountsId     = $app.findCollectionByNameOrId("accounts").id;

    // ── purchase_invoices ────────────────────────────────────────────────────
    let purchaseInvoicesId;
    try {
      purchaseInvoicesId = $app.findCollectionByNameOrId("purchase_invoices").id;
    } catch (_) {
      const col = new Collection({
        name: "purchase_invoices",
        type: "base",
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "number",            type: "text",     required: true  },
          { name: "date",              type: "text",     required: true  },
          { name: "due_date",          type: "text",     required: false },
          { name: "supplier_id",       type: "relation", required: true,  collectionId: thirdPartiesId, cascadeDelete: false },
          { name: "supplier_ref",      type: "text",     required: false },
          { name: "tx_type_id",        type: "relation", required: false, collectionId: txTypesId,      cascadeDelete: false },
          { name: "tx_number",         type: "text",     required: false },
          { name: "warehouse_id",      type: "relation", required: false, collectionId: warehousesId,   cascadeDelete: false },
          { name: "notes",             type: "text",     required: false },
          { name: "status",            type: "select",   required: false,
            values: ["draft","posted","voided"] },
          { name: "subtotal",          type: "number",   required: false, min: 0 },
          { name: "iva_total",         type: "number",   required: false, min: 0 },
          { name: "total",             type: "number",   required: false, min: 0 },
          { name: "ret_total",         type: "number",   required: false, min: 0 },
          { name: "payable_total",     type: "number",   required: false, min: 0 },
          { name: "tx_id",             type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false },
          { name: "inv_movement_id",   type: "relation", required: false, collectionId: $app.findCollectionByNameOrId("inventory_movements").id, cascadeDelete: false },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_purchase_inv_number ON purchase_invoices (number)"],
      });
      $app.save(col);
      purchaseInvoicesId = col.id;
      console.log("[GRAVY] Colección purchase_invoices creada (migración).");
    }

    // Asegura campos contables de comprobante en instalaciones existentes
    try {
      const invCol = $app.findCollectionByNameOrId("purchase_invoices");
      let changed = false;

      let hasTxType = false;
      try { hasTxType = !!invCol.fields.getByName("tx_type_id"); } catch (_) { hasTxType = String(invCol.fields || "").includes("tx_type_id"); }
      if (!hasTxType) {
        invCol.fields.add(new RelationField({ name: "tx_type_id", required: false, collectionId: txTypesId, cascadeDelete: false }));
        changed = true;
      }

      let hasTxNumber = false;
      try { hasTxNumber = !!invCol.fields.getByName("tx_number"); } catch (_) { hasTxNumber = String(invCol.fields || "").includes("tx_number"); }
      if (!hasTxNumber) {
        invCol.fields.add(new TextField({ name: "tx_number", required: false }));
        changed = true;
      }

      if (changed) {
        $app.save(invCol);
        console.log("[GRAVY] Campos tx_type_id/tx_number agregados a purchase_invoices.");
      }
    } catch (mErr) {
      console.log("[GRAVY] Aviso migrando campos de comprobante en compras: " + mErr);
    }

    // ── purchase_invoice_lines ───────────────────────────────────────────────
    try {
      $app.findCollectionByNameOrId("purchase_invoice_lines");
    } catch (_) {
      const col = new Collection({
        name: "purchase_invoice_lines",
        type: "base",
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
        deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        fields: [
          { name: "invoice_id",  type: "relation", required: true,  collectionId: purchaseInvoicesId, cascadeDelete: true  },
          { name: "product_id",  type: "relation", required: false, collectionId: productsId,          cascadeDelete: false },
          { name: "account_id",  type: "relation", required: false, collectionId: accountsId,          cascadeDelete: false },
          { name: "description", type: "text",     required: false },
          { name: "qty",         type: "number",   required: true,  min: 0 },
          { name: "unit_price",  type: "number",   required: true,  min: 0 },
          { name: "iva_rate",    type: "number",   required: false, min: 0 },
          { name: "subtotal",    type: "number",   required: false, min: 0 },
          { name: "iva_amount",  type: "number",   required: false, min: 0 },
          { name: "ret_rule_id", type: "text",     required: false },
          { name: "ret_concept", type: "text",     required: false },
          { name: "ret_base_type", type: "text",   required: false },
          { name: "ret_base",    type: "number",   required: false, min: 0 },
          { name: "ret_rate",    type: "number",   required: false, min: 0 },
          { name: "ret_amount",  type: "number",   required: false, min: 0 },
          { name: "ret_account_code", type: "text", required: false },
          { name: "total",       type: "number",   required: false, min: 0 },
          { name: "line_order",  type: "number",   required: false },
        ],
      });
      $app.save(col);
      console.log("[GRAVY] Colección purchase_invoice_lines creada (migración).");
    }

    // Campos de retención en compras para instalaciones existentes
    try {
      const invCol = $app.findCollectionByNameOrId("purchase_invoices");
      let changedInv = false;
      const invExtra = [
        ["ret_total", new NumberField({ name: "ret_total", required: false, min: 0 })],
        ["payable_total", new NumberField({ name: "payable_total", required: false, min: 0 })],
        ["ret_rule_renta_id", new TextField({ name: "ret_rule_renta_id", required: false })],
        ["ret_rule_ica_id",   new TextField({ name: "ret_rule_ica_id",   required: false })],
        ["ret_rule_iva_id",   new TextField({ name: "ret_rule_iva_id",   required: false })],
      ];
      for (const [fname, fieldObj] of invExtra) {
        let hasIt = false;
        try { hasIt = !!invCol.fields.getByName(fname); } catch (_) { hasIt = String(invCol.fields || "").includes(fname); }
        if (!hasIt) {
          invCol.fields.add(fieldObj);
          changedInv = true;
        }
      }
      if (changedInv) $app.save(invCol);
    } catch (mErr) {
      console.log("[GRAVY] Aviso migrando totales de retención en purchase_invoices: " + mErr);
    }

    try {
      const lineCol = $app.findCollectionByNameOrId("purchase_invoice_lines");
      let changedLines = false;
      const lineExtra = [
        ["ret_rule_id", new TextField({ name: "ret_rule_id", required: false })],
        ["ret_concept", new TextField({ name: "ret_concept", required: false })],
        ["ret_base_type", new TextField({ name: "ret_base_type", required: false })],
        ["ret_base", new NumberField({ name: "ret_base", required: false, min: 0 })],
        ["ret_rate", new NumberField({ name: "ret_rate", required: false, min: 0 })],
        ["ret_amount", new NumberField({ name: "ret_amount", required: false, min: 0 })],
        ["ret_account_code", new TextField({ name: "ret_account_code", required: false })],
      ];
      for (const [fname, fieldObj] of lineExtra) {
        let hasIt = false;
        try { hasIt = !!lineCol.fields.getByName(fname); } catch (_) { hasIt = String(lineCol.fields || "").includes(fname); }
        if (!hasIt) {
          lineCol.fields.add(fieldObj);
          changedLines = true;
        }
      }
      if (changedLines) $app.save(lineCol);
    } catch (mErr2) {
      console.log("[GRAVY] Aviso migrando campos de retención en purchase_invoice_lines: " + mErr2);
    }

    try {
      const txCol = $app.findCollectionByNameOrId("transactions");
      let changedTx = false;
      const txExtra = [
        ["teso_mode", new TextField({ name: "teso_mode", required: false })],
        ["teso_params", new TextField({ name: "teso_params", required: false })],
      ];
      for (const [fname, fieldObj] of txExtra) {
        let hasIt = false;
        try { hasIt = !!txCol.fields.getByName(fname); } catch (_) { hasIt = String(txCol.fields || "").includes(fname); }
        if (!hasIt) {
          txCol.fields.add(fieldObj);
          changedTx = true;
        }
      }
      if (changedTx) $app.save(txCol);
    } catch (err) {
      console.log("[GRAVY] Aviso migrando transactions: " + err);
    }
  } catch (err) {
    console.log("[GRAVY] Aviso migrando colecciones de compras: " + err);
  }
});

// ── Ruta custom de auditoría (sustituye createRule en audit_log) ──────────────
// Solo usuarios autenticados pueden registrar eventos; el servidor escribe
// directamente en audit_log con IP real y validación server-side.
routerAdd("POST", "/api/audit-event", (e) => {
  const info = e.requestInfo();
  const auth = info?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida" });
    return;
  }

  const body      = info?.body || {};
  const action    = String(body.action    || "").slice(0, 100).trim();
  const entity    = String(body.entity    || "").slice(0, 100).trim();
  const entityId  = String(body.entity_id || "").slice(0, 100).trim();
  const details   = String(body.details   || "").slice(0, 500).trim();

  if (!action || !entity) {
    e.json(400, { message: "Los campos action y entity son obligatorios" });
    return;
  }

  try {
    const auditCol = $app.findCollectionByNameOrId("audit_log");
    const userId   = String(auth.id || "");
    const username = String(
      auth.getString?.("email") ||
      auth.getString?.("username") ||
      userId || "system"
    );
    const remoteIp = (typeof e.realIP === "function") ? String(e.realIP() || "") : "";

    const payload = {
      action, entity,
      entity_id: entityId,
      event_at:  (new Date()).toISOString().replace("T", " ").slice(0, 19),
      details,
      ip: remoteIp,
      username,
    };
    if (userId) payload.user_id = userId;

    const log = new Record(auditCol, payload);
    $app.save(log);
    e.json(200, { ok: true });
  } catch (err) {
    e.json(500, { message: "No se pudo registrar el evento: " + String(err) });
  }
});
