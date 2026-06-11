/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  // add field
  collection.fields.addAt(35, new Field({
    "help": "",
    "hidden": false,
    "id": "number3608520774",
    "max": null,
    "min": 0,
    "name": "stock_min",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(36, new Field({
    "help": "",
    "hidden": false,
    "id": "number3944257311",
    "max": null,
    "min": 0,
    "name": "stock_max",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  // remove field
  collection.fields.removeById("number3608520774")

  // remove field
  collection.fields.removeById("number3944257311")

  return app.save(collection)
})
