/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3922105078"); // imports

  if (collection && !collection.fields.getByName("stage_expenses")) {
    collection.fields.addAt(collection.fields.length, new Field({
      "id":          "json1784400001",
      "name":        "stage_expenses",
      "type":        "json",
      "system":      false,
      "required":    false,
      "hidden":      false,
      "presentable": false,
      "protected":   false,
      "maxSize":     2000000
    }));
    return app.save(collection);
  }

  return null;
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3922105078");
  try {
    if (collection) {
      collection.fields.removeById("json1784400001");
      return app.save(collection);
    }
  } catch (e) {
    return null;
  }
});
