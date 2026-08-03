/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  try {
    // 1. Añadir campos teso_mode y teso_params a transactions si no existen
    const transactions = $app.findCollectionByNameOrId("transactions");
    let needsSaveTx = false;
    
    if (!transactions.fields.getByName("teso_mode")) {
      transactions.fields.add(new Field({
        name: "teso_mode",
        type: "text",
        required: false
      }));
      needsSaveTx = true;
    }
    
    if (!transactions.fields.getByName("teso_params")) {
      transactions.fields.add(new Field({
        name: "teso_params",
        type: "json",
        required: false
      }));
      needsSaveTx = true;
    }
    
    if (needsSaveTx) {
      $app.save(transactions);
      console.log("[GRAVY] Añadidos campos de tesorería a colección transactions.");
    }
  } catch (err) {
    console.error("[GRAVY] Error modificando transactions para tesorería:", err);
  }

  // 2. Crear colección treasury_settings si no existe
  try {
    $app.findCollectionByNameOrId("treasury_settings");
    // Ya existe
  } catch (_) {
    try {
      const treasurySettings = new Collection({
        name: "treasury_settings",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        updateRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
        deleteRule: null,
        fields: [
          { name: "default_bank_account_id", type: "relation", required: false, collectionId: $app.findCollectionByNameOrId("accounts").id, cascadeDelete: false },
          { name: "default_cash_account_id", type: "relation", required: false, collectionId: $app.findCollectionByNameOrId("accounts").id, cascadeDelete: false },
          { name: "auto_rules", type: "json", required: false }
        ]
      });
      $app.save(treasurySettings);
      console.log("[GRAVY] Creada colección treasury_settings.");
      
      // Crear registro por defecto
      const defSettings = new Record(treasurySettings);
      defSettings.set("auto_rules", JSON.stringify({ prioridadConceptos: [], primeroVencido: true, primeroMora: true }));
      $app.save(defSettings);
    } catch (err) {
      console.error("[GRAVY] Error creando treasury_settings:", err);
    }
  }
});
