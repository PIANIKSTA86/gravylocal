/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let collection;
  try {
    collection = app.findCollectionByNameOrId("appointments");
  } catch (_) {
    collection = app.findCollectionByNameOrId("pbc_1037645436");
  }

  let clientCol = null;
  try {
    clientCol = app.findCollectionByNameOrId("third_parties");
  } catch (_) {
    try { clientCol = app.findCollectionByNameOrId("pbc_955284662"); } catch (_) {}
  }

  let spaCol = null;
  try {
    spaCol = app.findCollectionByNameOrId("spa_clients");
  } catch (_) {
    try { spaCol = app.findCollectionByNameOrId("pbc_1346741877"); } catch (_) {
      try { spaCol = app.findCollectionByNameOrId("pbc_spa_clients_01"); } catch (_) {}
    }
  }

  if (clientCol && !collection.fields.getByName("client_id")) {
    collection.fields.add(new Field({
      "cascadeDelete": false,
      "collectionId": clientCol.id,
      "help": "",
      "hidden": false,
      "id": "relation434858273",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "client_id",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    }));
  }

  if (spaCol && !collection.fields.getByName("spa_client_id")) {
    collection.fields.add(new Field({
      "cascadeDelete": false,
      "collectionId": spaCol.id,
      "help": "",
      "hidden": false,
      "id": "relation178732686",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "spa_client_id",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    }));
  }

  return app.save(collection);
}, (app) => {
  let collection;
  try {
    collection = app.findCollectionByNameOrId("appointments");
  } catch (_) {
    collection = app.findCollectionByNameOrId("pbc_1037645436");
  }

  try { collection.fields.removeById("relation434858273"); } catch (_) {}
  try { collection.fields.removeById("relation178732686"); } catch (_) {}

  return app.save(collection);
});
