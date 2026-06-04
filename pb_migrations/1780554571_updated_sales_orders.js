/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2420370400")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_955284662",
    "help": "",
    "hidden": false,
    "id": "relation2380800217",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "seller_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2420370400")

  // remove field
  collection.fields.removeById("relation2380800217")

  return app.save(collection)
})
