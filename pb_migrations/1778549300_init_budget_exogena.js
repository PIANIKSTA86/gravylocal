/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // --- Collection: ph_budgets ---
  const phBudgets = new Collection({
    "name": "ph_budgets",
    "type": "base",
    "fields": [
      { "name": "name", "type": "text", "required": true },
      { "name": "year", "type": "number", "required": true },
      { "name": "status", "type": "select", "values": ["draft", "approved", "archived"], "required": true },
      { "name": "total_amount", "type": "number" }
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''"
  });
  app.save(phBudgets);

  // --- Collection: ph_budget_lines ---
  const phBudgetLines = new Collection({
    "name": "ph_budget_lines",
    "type": "base",
    "fields": [
      { "name": "budget_id", "type": "relation", "collectionId": phBudgets.id, "required": true, "maxSelect": 1 },
      { "name": "account_id", "type": "relation", "collectionId": app.findCollectionByNameOrId("accounts").id, "required": true, "maxSelect": 1 },
      { "name": "annual_amount", "type": "number", "required": true },
      { "name": "monthly_distribution", "type": "json" }
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''"
  });
  app.save(phBudgetLines);

  // --- Collection: exogena_concepts ---
  const exogenaConcepts = new Collection({
    "name": "exogena_concepts",
    "type": "base",
    "fields": [
      { "name": "code", "type": "text", "required": true },
      { "name": "name", "type": "text", "required": true },
      { "name": "account_ranges", "type": "text" },
      { "name": "format_type", "type": "select", "values": ["1001", "1007", "1008", "1009"], "required": true }
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''"
  });
  app.save(exogenaConcepts);

}, (app) => {
  const phBudgets = app.findCollectionByNameOrId("ph_budgets");
  const phBudgetLines = app.findCollectionByNameOrId("ph_budget_lines");
  const exogenaConcepts = app.findCollectionByNameOrId("exogena_concepts");

  if (phBudgetLines) app.delete(phBudgetLines);
  if (phBudgets) app.delete(phBudgets);
  if (exogenaConcepts) app.delete(exogenaConcepts);
})
