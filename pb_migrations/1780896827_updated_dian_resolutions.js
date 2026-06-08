/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4258913350")

  // update field
  collection.fields.addAt(1, new Field({
    "help": "",
    "hidden": false,
    "id": "select728423354",
    "maxSelect": 0,
    "name": "document_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "FV",
      "POS",
      "DS",
      "NE",
      "NC",
      "ND"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4258913350")

  // update field
  collection.fields.addAt(1, new Field({
    "help": "",
    "hidden": false,
    "id": "select728423354",
    "maxSelect": 0,
    "name": "document_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "FV",
      "POS",
      "DS",
      "NE"
    ]
  }))

  return app.save(collection)
})
