/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_955284662"); // third_parties
  if (!collection.fields.getByName("gcm")) {
    collection.fields.addAt(collection.fields.length, new Field({
      "id": "bool3200000000",
      "name": "gcm",
      "type": "bool",
      "system": false,
      "required": false,
      "hidden": false,
      "presentable": false
    }));
    return app.save(collection);
  }
  return null;
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_955284662"); // third_parties
  try {
    collection.fields.removeById("bool3200000000");
    return app.save(collection);
  } catch (e) {
    return null;
  }
});
