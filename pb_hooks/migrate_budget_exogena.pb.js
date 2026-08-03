/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_budget_exogena.pb.js
 * Crea colecciones ph_budgets, ph_budget_lines y exogena_concepts en onBootstrap.
 */

onBootstrap((e) => {
  e.next();

  let accountsId = "";
  try {
    accountsId = $app.findCollectionByNameOrId("accounts").id;
  } catch (err) {
    console.log("[GRAVY-PRESUPUESTO] Error: no se pudo obtener la colección accounts: " + err);
    return;
  }

  const writeRule = "@request.auth.id != ''";
  const deleteRule = "@request.auth.id != ''";

  // 1. COLECCIÓN: ph_budgets
  let phBudgetsId = "";
  try {
    phBudgetsId = $app.findCollectionByNameOrId("ph_budgets").id;
  } catch (_) {
    try {
      const phBudgets = new Collection({
        name: "ph_budgets",
        type: "base",
        listRule: writeRule,
        viewRule: writeRule,
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "name", type: "text", required: true },
          { name: "year", type: "number", required: true },
          { name: "status", type: "select", required: true, values: ["draft", "approved", "archived"] },
          { name: "total_amount", type: "number", required: false }
        ]
      });
      $app.save(phBudgets);
      phBudgetsId = phBudgets.id;
      console.log("[GRAVY-PRESUPUESTO] Colección ph_budgets creada.");
    } catch (err) {
      console.log("[GRAVY-PRESUPUESTO] Error al crear ph_budgets: " + err);
    }
  }

  // 2. COLECCIÓN: ph_budget_lines
  try {
    $app.findCollectionByNameOrId("ph_budget_lines");
  } catch (_) {
    try {
      if (!phBudgetsId) {
        phBudgetsId = $app.findCollectionByNameOrId("ph_budgets").id;
      }
      const phBudgetLines = new Collection({
        name: "ph_budget_lines",
        type: "base",
        listRule: writeRule,
        viewRule: writeRule,
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "budget_id", type: "relation", required: true, collectionId: phBudgetsId, maxSelect: 1 },
          { name: "account_id", type: "relation", required: true, collectionId: accountsId, maxSelect: 1 },
          { name: "annual_amount", type: "number", required: true },
          { name: "monthly_distribution", type: "json", required: false }
        ]
      });
      $app.save(phBudgetLines);
      console.log("[GRAVY-PRESUPUESTO] Colección ph_budget_lines creada.");
    } catch (err) {
      console.log("[GRAVY-PRESUPUESTO] Error al crear ph_budget_lines: " + err);
    }
  }

  // 3. COLECCIÓN: exogena_concepts
  try {
    $app.findCollectionByNameOrId("exogena_concepts");
  } catch (_) {
    try {
      const exogenaConcepts = new Collection({
        name: "exogena_concepts",
        type: "base",
        listRule: writeRule,
        viewRule: writeRule,
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "code", type: "text", required: true },
          { name: "name", type: "text", required: true },
          { name: "account_ranges", type: "text", required: false },
          { name: "format_type", type: "select", required: true, values: ["1001", "1007", "1008", "1009"] }
        ]
      });
      $app.save(exogenaConcepts);
      console.log("[GRAVY-EXOGENA] Colección exogena_concepts creada.");
    } catch (err) {
      console.log("[GRAVY-EXOGENA] Error al crear exogena_concepts: " + err);
    }
  }
});
