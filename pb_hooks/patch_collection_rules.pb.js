/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — patch_collection_rules.pb.js
 * Parche idempotente: amplía las reglas de escritura de TODAS las colecciones
 * comerciales/contables para incluir los roles superadmin y administrador.
 *
 * Colecciones afectadas: settings, invoices, invoice_lines, pos_shifts,
 * transactions, transaction_lines, inventory_movements, inventory_stock,
 * third_parties, products, warehouses.
 *
 * Este archivo puede eliminarse luego de reiniciar PocketBase una vez.
 */
onBootstrap((e) => {
  e.next();

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  const collections = [
    "settings",
    "invoices",
    "invoice_lines",
    "pos_shifts",
    "transactions",
    "transaction_lines",
    "inventory_movements",
    "inventory_stock",
    "third_parties",
    "products",
    "warehouses",
    "accounts",
    "purchase_orders",
    "purchase_lines",
    "transaction_types",
  ];

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
      if (col.deleteRule !== deleteRule && col.deleteRule !== null) {
        col.deleteRule = deleteRule;
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

  console.log('[GRAVY-PATCH] patch_collection_rules completado.');
});
