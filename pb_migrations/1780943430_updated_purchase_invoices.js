/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3726714070")

  // add field
  collection.fields.addAt(22, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4258913350",
    "help": "",
    "hidden": false,
    "id": "relation3439706011",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "dian_resolution_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3726714070")

  // remove field
  collection.fields.removeById("relation3439706011")

  return app.save(collection)
})
