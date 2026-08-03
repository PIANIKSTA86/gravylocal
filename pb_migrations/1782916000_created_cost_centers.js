/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    app.findCollectionByNameOrId("cost_centers");
    return;
  } catch (_) {}

  const collection = new Collection({
    "id": "pbc_cost_centers",
    "name": "cost_centers",
    "type": "base",
    "system": false,
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')",
    "updateRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')",
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
        "id": "text_code_cc",
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
        "id": "text_name_cc",
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
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_desc_cc",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool_active_cc",
        "name": "active",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_cost_centers_code` ON `cost_centers` (`code`)"
    ]
  });

  app.save(collection);

  // Agregar parent_id autorreferenciado una vez guardada la colección usando new Field() y addAt()
  const updatedCollection = app.findCollectionByNameOrId("cost_centers");
  updatedCollection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_cost_centers",
    "help": "",
    "hidden": false,
    "id": "relation_parent_cc",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "parent_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }));
  app.save(updatedCollection);

  // Modificar tx_lines para agregar cost_center_id usando new Field() y addAt()
  const txLinesCol = app.findCollectionByNameOrId("tx_lines");
  txLinesCol.fields.addAt(txLinesCol.fields.length, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_cost_centers",
    "help": "",
    "hidden": false,
    "id": "relation_cost_center_line",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "cost_center_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }));
  app.save(txLinesCol);

}, (app) => {
  try {
    const txLinesCol = app.findCollectionByNameOrId("tx_lines");
    txLinesCol.fields.removeById("relation_cost_center_line");
    app.save(txLinesCol);
  } catch (_) {}

  try {
    const collection = app.findCollectionByNameOrId("cost_centers");
    app.delete(collection);
  } catch (_) {}
});
