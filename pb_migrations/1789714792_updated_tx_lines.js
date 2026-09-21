/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2785691647")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3922105078",
    "help": "Importación vinculada",
    "hidden": false,
    "id": "relation3064095705",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "import_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "select4099590588",
    "maxSelect": 1,
    "name": "import_concept",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "fob",
      "freight",
      "insurance",
      "customs",
      "local_carrier",
      "local_other"
    ]
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text954374784",
    "max": 100,
    "min": 0,
    "name": "import_invoice_ref",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "number383696783",
    "max": null,
    "min": null,
    "name": "import_trm",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2785691647")

  // remove field
  collection.fields.removeById("relation3064095705")

  // remove field
  collection.fields.removeById("select4099590588")

  // remove field
  collection.fields.removeById("text954374784")

  // remove field
  collection.fields.removeById("number383696783")

  return app.save(collection)
})
