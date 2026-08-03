/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Crear colección spa_clients (Expediente de Estética y Belleza Humana)
  try {
    app.findCollectionByNameOrId("spa_clients");
  } catch (_) {
    const spaClientsCol = new Collection({
      "id": "pbc_spa_clients_01",
      "name": "spa_clients",
      "type": "base",
      "system": false,
      "createRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor' || @request.auth.role = 'cajero')",
      "deleteRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')",
      "listRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor' || @request.auth.role = 'cajero')",
      "viewRule": "@request.auth.id != ''",
      "fields": [
        {
          "id": "text3208210256",
          "name": "id",
          "type": "text",
          "primaryKey": true,
          "required": true,
          "system": true,
          "autogeneratePattern": "[a-z0-9]{15}"
        },
        {
          "id": "rel_client_id_01",
          "name": "client_id",
          "type": "relation",
          "collectionId": "pbc_955284662", // third_parties
          "required": true,
          "maxSelect": 1
        },
        {
          "id": "sel_skin_type_01",
          "name": "skin_type",
          "type": "select",
          "required": false,
          "maxSelect": 1,
          "values": ["GRASA", "SECA", "MIXTA", "SENSIBLE", "NORMAL"]
        },
        {
          "id": "txt_allergies_01",
          "name": "allergies",
          "type": "text",
          "required": false
        },
        {
          "id": "txt_med_cond_01",
          "name": "medical_conditions",
          "type": "text",
          "required": false
        },
        {
          "id": "txt_treat_notes_01",
          "name": "treatment_notes",
          "type": "text",
          "required": false
        },
        {
          "id": "txt_birthdate_01",
          "name": "birthdate",
          "type": "text",
          "required": false
        },
        {
          "id": "autodate2990389176",
          "name": "created",
          "type": "autodate",
          "onCreate": true,
          "onUpdate": false
        },
        {
          "id": "autodate3332085495",
          "name": "updated",
          "type": "autodate",
          "onCreate": true,
          "onUpdate": true
        }
      ]
    });
    app.save(spaClientsCol);
  }

  // 2. Modificar appointments para hacer pet_id opcional y agregar spa_client_id
  try {
    const apptsCol = app.findCollectionByNameOrId("appointments");
    
    // Hacer pet_id opcional
    const petField = apptsCol.fields.getByName("pet_id");
    if (petField) {
      petField.required = false;
    }

    // Agregar spa_client_id si no existe
    try {
      apptsCol.fields.getByName("spa_client_id");
    } catch (_) {
      apptsCol.fields.addAt(2, new Field({
        "id": "rel_spa_client_id",
        "name": "spa_client_id",
        "type": "relation",
        "collectionId": "pbc_spa_clients_01",
        "required": false,
        "maxSelect": 1
      }));
    }

    // Agregar client_id directo si no existe (para relacionar directos a third_parties en Belleza)
    try {
      apptsCol.fields.getByName("client_id");
    } catch (_) {
      apptsCol.fields.addAt(3, new Field({
        "id": "rel_client_direct_id",
        "name": "client_id",
        "type": "relation",
        "collectionId": "pbc_955284662",
        "required": false,
        "maxSelect": 1
      }));
    }

    app.save(apptsCol);
  } catch (err) {
    console.log("Error actualizando appointments migration:", err);
  }
}, (app) => {
  try {
    const spaCol = app.findCollectionByNameOrId("spa_clients");
    if (spaCol) app.delete(spaCol);
  } catch (_) {}
});
