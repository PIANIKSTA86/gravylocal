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
      if (!existing.has(fieldName)) {
        col.fields.add(new RelationField({
          name: fieldName,
          collectionId: branchesId,
          required: false,
          cascadeDelete: false,
          maxSelect: maxSelect
        }));
        $app.save(col);
        console.log(`[GRAVY-BRANCHES] Campo ${fieldName} agregado a ${collectionName}.`);
      }
    } catch (err) {
      console.log(`[GRAVY-BRANCHES] Aviso al extender ${collectionName} con ${fieldName}: ${err}`);
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
  }
});
