/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — patch_collection_rules.pb.js
 * Parche idempotente: amplía las reglas de escritura de colecciones
 * comerciales/contables para incluir los roles correctos.
 *
 * - pos_shifts e invoices/invoice_lines: incluyen 'cajero' y 'vendedor'
 *   ya que son colecciones de operación diaria del POS.
 * - El resto de colecciones contables/administrativas mantienen
 *   la regla estricta (sin cajero).
 *
 * Colecciones POS (cajero puede escribir):
 *   pos_shifts, invoices, invoice_lines
 *
 * Colecciones administrativas (sin cajero):
 *   settings, transactions, tx_lines, inventory_movements,
 *   inventory_stock, third_parties, products, warehouses,
 *   accounts, purchase_orders, purchase_lines, purchase_invoices,
 *   purchase_invoice_lines, transaction_types.
 */
onBootstrap((e) => {
  e.next();

  // Regla para colecciones administrativas/contables (sin cajero)
  const writeRuleAdmin = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";

  // Regla para colecciones de operación POS (cajero y vendedor incluidos)
  const writeRulePOS = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'cajero' || @request.auth.role = 'vendedor')";

  const deleteRuleHeader = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";
  const deleteRuleLine = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";

  // Colecciones de operación POS: cajero debe poder crear/actualizar
  const posCollections = [
    "pos_shifts",
    "invoices",
    "invoice_lines",
    "transactions",
    "tx_lines",
    "inventory_movements",
    "inventory_movement_lines",
    "inventory_stock",
    "sales_orders",
    "sales_order_lines",
  ];

  // Colecciones administrativas/contables: sin cajero
  const adminCollections = [
    "settings",
    "third_parties",
    "products",
    "warehouses",
    "accounts",
    "purchase_orders",
    "purchase_lines",
    "purchase_invoices",
    "purchase_invoice_lines",
    "transaction_types",
    "payroll_periods",
    "payroll_lines",
    "payroll_novelties",
    "electronic_payrolls",
    "payroll_documents",
    "bank_accounts",       // FIX: regla original solo permitía 'admin'|'contador' → excluía 'administrador', 'auxiliar', etc.
    "bank_movements",      // FIX: idem — debe permitir mismo set de roles que las demás colecciones contables
    "inmo_properties",
    "inmo_contracts",
    "inmo_invoices",
    "inmo_invoice_lines",
    "inmo_property_history",
  ];

  const lineCollections = new Set([
    "tx_lines",
    "invoice_lines",
    "purchase_lines",
    "purchase_invoice_lines",
    "inventory_movement_lines",
    "sales_order_lines",
    "payroll_lines",
    "payroll_novelties",
    "inmo_invoice_lines"
  ]);

  function applyRules(collections, writeRule) {
    for (const colName of collections) {
      try {
        const col = $app.findCollectionByNameOrId(colName);
        let changed = false;

        if (col.createRule !== writeRule) {
          col.createRule = writeRule;
          changed = true;
        }
        if (col.updateRule !== writeRule) {
          col.updateRule = writeRule;
          changed = true;
        }
        const expectedDeleteRule = lineCollections.has(colName) ? deleteRuleLine : deleteRuleHeader;
        if (col.deleteRule !== expectedDeleteRule && col.deleteRule !== null && colName !== 'settings') {
          col.deleteRule = expectedDeleteRule;
          changed = true;
        }

        if (changed) {
          $app.save(col);
          console.log('[GRAVY-PATCH] Reglas actualizadas: ' + colName);
        }
      } catch (err) {
        console.log('[GRAVY-PATCH] Aviso (' + colName + '): ' + err);
      }
    }
  }

  applyRules(posCollections, writeRulePOS);
  applyRules(adminCollections, writeRuleAdmin);

  // Parche para permitir a usuarios logueados consultar la lista de usuarios (necesario para expansiones de cajero en POS)
  try {
    const usersCol = $app.findCollectionByNameOrId('users');
    let usersChanged = false;
    const userReadRule = "@request.auth.id != ''";
    if (usersCol.listRule !== userReadRule) {
      usersCol.listRule = userReadRule;
      usersChanged = true;
    }
    if (usersCol.viewRule !== userReadRule) {
      usersCol.viewRule = userReadRule;
      usersChanged = true;
    }
    if (usersChanged) {
      $app.save(usersCol);
      console.log('[GRAVY-PATCH] Reglas de lectura de users actualizadas.');
    }
  } catch (err) {
    console.log('[GRAVY-PATCH] Aviso al actualizar reglas de users: ' + err);
  }

  // Parche para permitir a los vendedores (y cualquier usuario autenticado) ver productos, clientes y tarifas
  const readRulesQuery = "@request.auth.id != ''";
  const collectionsToRead = ['products', 'clientes', 'listas_precios', 'precios_producto', 'third_parties'];
  for (const name of collectionsToRead) {
    try {
      const col = $app.findCollectionByNameOrId(name);
      let changed = false;
      if (col.listRule !== readRulesQuery) {
        col.listRule = readRulesQuery;
        changed = true;
      }
      if (col.viewRule !== readRulesQuery) {
        col.viewRule = readRulesQuery;
        changed = true;
      }
      if (changed) {
        $app.save(col);
        console.log('[GRAVY-PATCH] Reglas de lectura actualizadas para: ' + name);
      }
    } catch (err) {
      console.log('[GRAVY-PATCH] Aviso al actualizar reglas de lectura en ' + name + ': ' + err);
    }
  }

  // Parche para asegurar reglas de lectura de auditoría para superadmin, admin y auditor
  try {
    const auditCol = $app.findCollectionByNameOrId('audit_log');
    let auditChanged = false;
    const auditReadRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'auditor')";
    if (auditCol.listRule !== auditReadRule) {
      auditCol.listRule = auditReadRule;
      auditChanged = true;
    }
    if (auditCol.viewRule !== auditReadRule) {
      auditCol.viewRule = auditReadRule;
      auditChanged = true;
    }
    if (auditChanged) {
      $app.save(auditCol);
      console.log('[GRAVY-PATCH] Reglas de lectura de audit_log actualizadas.');
    }
  } catch (err) {
    console.log('[GRAVY-PATCH] Aviso al actualizar reglas de audit_log: ' + err);
  }

  console.log('[GRAVY-PATCH] patch_collection_rules completado.');
});
