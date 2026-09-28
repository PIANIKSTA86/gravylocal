/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2785691647")

  // update field
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
      "local_other",
      "bank_fees",
      "payment"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2785691647")

  // update field
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

  return app.save(collection)
})
