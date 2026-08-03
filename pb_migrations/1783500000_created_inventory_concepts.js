/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let conceptsCol;
  try {
    conceptsCol = app.findCollectionByNameOrId("inventory_concepts");
  } catch (_) {}

  if (!conceptsCol) {
    const accountsCol = app.findCollectionByNameOrId("accounts");

    conceptsCol = new Collection({
      "id": "pbc_inventory_concepts",
      "name": "inventory_concepts",
      "type": "base",
      "system": false,
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')",
      "updateRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')",
      "deleteRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "help": "",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_code_ic",
          "max": 0,
          "min": 0,
          "name": "code",
          "pattern": "",
          "presentable": true,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_name_ic",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": true,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "select_type_ic",
          "maxSelect": 1,
          "name": "type",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "ENTRADA",
            "SALIDA",
            "AMBOS"
          ]
        },
        {
          "cascadeDelete": false,
          "collectionId": accountsCol.id,
          "help": "",
          "hidden": false,
          "id": "relation_account_ic",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "account_id",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "help": "",
          "hidden": false,
          "id": "bool_active_ic",
          "name": "active",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_desc_ic",
          "max": 0,
          "min": 0,
          "name": "description",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX `idx_inventory_concepts_code` ON `inventory_concepts` (`code`)"
      ]
    });

    app.save(conceptsCol);
  }

  // Modificar inventory_movements para agregar concept_id
  try {
    const movCol = app.findCollectionByNameOrId("inventory_movements");
    const hasConceptId = movCol.fields.find(f => f.name === "concept_id");
    if (!hasConceptId) {
      movCol.fields.addAt(movCol.fields.length, new Field({
        "cascadeDelete": false,
        "collectionId": "pbc_inventory_concepts",
        "help": "",
        "hidden": false,
        "id": "relation_concept_mov",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "concept_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      }));
      app.save(movCol);
    }
  } catch (err) {
    console.log("Error updating inventory_movements relation in migration:", err);
  }

  // Sembrar conceptos iniciales de inventario si está vacía
  try {
    const totalConcepts = app.countRecords("inventory_concepts");
    if (totalConcepts === 0) {
      const findAccountByCodes = (codes) => {
        for (const code of codes) {
          try {
            const acc = app.findFirstRecordByData("accounts", "code", code);
            if (acc) return acc.id;
          } catch (_) {}
        }
        try {
          const acc = app.findFirstRecordByData("accounts", "active", true);
          if (acc) return acc.id;
        } catch (_) {}
        return null;
      };

      const accDeterioro  = findAccountByCodes(["613505", "6135", "519535", "5195"]);
      const accConsumo    = findAccountByCodes(["519535", "5195", "519595", "6135"]);
      const accSobrante   = findAccountByCodes(["427505", "4275", "429550", "4295"]);
      const accAjusteEnt  = findAccountByCodes(["143505", "1435", "4275", "6135"]);
      const accMuestra    = findAccountByCodes(["5195", "519535", "6135"]);

      const initialConcepts = [
        { code: "CON-SAL-001", name: "Baja por Deterioro / Avería", type: "SALIDA", account_id: accDeterioro, active: true, description: "Salida por mercancía averiada, dañada o vencida" },
        { code: "CON-SAL-002", name: "Consumo Interno / Uso Propio", type: "SALIDA", account_id: accConsumo, active: true, description: "Uso o consumo interno de la empresa" },
        { code: "CON-SAL-003", name: "Muestras Médicas / Donaciones", type: "SALIDA", account_id: accMuestra, active: true, description: "Salida para promociones, muestras o donaciones" },
        { code: "CON-ENT-001", name: "Ingreso por Sobrante de Inventario", type: "ENTRADA", account_id: accSobrante, active: true, description: "Ajuste de entrada por sobrante físico detectado en bodega" },
        { code: "CON-ENT-002", name: "Ingreso por Ajuste de Inventario", type: "ENTRADA", account_id: accAjusteEnt, active: true, description: "Entrada por corrección o toma física de existencias" },
      ];

      const col = app.findCollectionByNameOrId("inventory_concepts");
      for (const item of initialConcepts) {
        if (!item.account_id) continue;
        const rec = new Record(col, item);
        app.save(rec);
      }
    }
  } catch (err) {
    console.log("Error seeding initial inventory concepts:", err);
  }

}, (app) => {
  try {
    const movCol = app.findCollectionByNameOrId("inventory_movements");
    movCol.fields.removeById("relation_concept_mov");
    app.save(movCol);
  } catch (_) {}

  try {
    const collection = app.findCollectionByNameOrId("inventory_concepts");
    app.delete(collection);
  } catch (_) {}
});
