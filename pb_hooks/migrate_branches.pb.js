/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_branches.pb.js
 * Módulo de Sucursales y Centros de Costo.
 * Crea la colección branches y establece relaciones en las colecciones pertinentes.
 */

onBootstrap((e) => {
  e.next();

  let branchesCol;
  let branchesId = "";

  // 1. Crear la colección branches si no existe
  try {
    branchesCol = $app.findCollectionByNameOrId("branches");
    branchesId = branchesCol.id;
  } catch (_) {
    try {
      const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
      const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

      branchesCol = new Collection({
        name: "branches",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "code", type: "text", required: true },
          { name: "name", type: "text", required: true },
          { name: "active", type: "bool", required: false }
        ]
      });
      $app.save(branchesCol);
      branchesId = branchesCol.id;
      console.log("[GRAVY-BRANCHES] Colección branches creada.");
    } catch (err) {
      console.error("[GRAVY-BRANCHES] Error al crear colección branches:", err);
      return;
    }
  }

  // 2. Sembrar sucursal por defecto "01 - Principal"
  if (branchesId) {
    try {
      $app.findFirstRecordByFilter("branches", 'code="01"');
    } catch (_) {
      try {
        const defBranch = new Record(branchesCol, {
          code: "01",
          name: "Principal",
          active: true
        });
        $app.save(defBranch);
        console.log("[GRAVY-BRANCHES] Sucursal por defecto '01 - Principal' sembrada.");
      } catch (err) {
        console.error("[GRAVY-BRANCHES] Error al sembrar sucursal por defecto:", err);
      }
    }
  }

  // 3. Crear índice único en branches (code)
  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_code ON branches (code)")
      .execute();
  } catch (err) {
    console.log("[GRAVY-BRANCHES] Aviso al crear índice único en branches: " + err);
  }

  // Helper para añadir relación a branches de forma segura e idempotente
  function addBranchRelation(collectionName, fieldName, maxSelect = 1) {
    try {
      const col = $app.findCollectionByNameOrId(collectionName);
      const existing = new Set(col.fields.fieldNames());
      let modified = false;

      if (!existing.has(fieldName)) {
        col.fields.add(new RelationField({
          name: fieldName,
          collectionId: branchesId,
          required: false,
          cascadeDelete: false,
          maxSelect: maxSelect
        }));
        modified = true;
        console.log(`[GRAVY-BRANCHES] Campo ${fieldName} agregado a ${collectionName}.`);
      }

      // Aplicar reglas de seguridad a nivel de base de datos
      const secureCollections = [
        'transactions', 'tx_lines', 'invoices', 'purchase_invoices',
        'inventory_movements', 'payroll_periods', 'pos_registers',
        'pos_shifts', 'sales_orders'
      ];

      if (secureCollections.includes(collectionName)) {
        const ruleCheck = "@request.auth.allowed_branches.id";
        const ruleToApply = "(@request.auth.allowed_branches.id = '' || @request.auth.allowed_branches.id ?= branch_id)";

        if (col.listRule !== null && !col.listRule.includes(ruleCheck)) {
          col.listRule = col.listRule ? `(${col.listRule}) && ${ruleToApply}` : ruleToApply;
          modified = true;
        }
        if (col.viewRule !== null && !col.viewRule.includes(ruleCheck)) {
          col.viewRule = col.viewRule ? `(${col.viewRule}) && ${ruleToApply}` : ruleToApply;
          modified = true;
        }
        if (col.createRule !== null && !col.createRule.includes(ruleCheck)) {
          col.createRule = col.createRule ? `(${col.createRule}) && ${ruleToApply}` : ruleToApply;
          modified = true;
        }
        if (col.updateRule !== null && !col.updateRule.includes(ruleCheck)) {
          col.updateRule = col.updateRule ? `(${col.updateRule}) && ${ruleToApply}` : ruleToApply;
          modified = true;
        }
      }

      if (modified) {
        $app.save(col);
      }
    } catch (err) {
      console.log(`[GRAVY-BRANCHES] Aviso al extender/asegurar ${collectionName}: ${err}`);
    }
  }

  // 4. Extender las colecciones con branch_id / allowed_branches
  if (branchesId) {
    // Users
    addBranchRelation("users", "default_branch_id", 1);
    addBranchRelation("users", "allowed_branches", 99);

    // Transactions
    addBranchRelation("transactions", "branch_id", 1);

    // Tx Lines
    addBranchRelation("tx_lines", "branch_id", 1);

    // Invoices
    addBranchRelation("invoices", "branch_id", 1);

    // Purchase Invoices
    addBranchRelation("purchase_invoices", "branch_id", 1);

    // Inventory Movements
    addBranchRelation("inventory_movements", "branch_id", 1);

    // Payroll Periods
    addBranchRelation("payroll_periods", "branch_id", 1);

    // POS Registers
    addBranchRelation("pos_registers", "branch_id", 1);

    // POS Shifts
    addBranchRelation("pos_shifts", "branch_id", 1);

    // Warehouses (Bodegas)
    addBranchRelation("warehouses", "branch_id", 1);

    // Sales Orders (Pedidos)
    addBranchRelation("sales_orders", "branch_id", 1);
  }
});

