/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_955284662"); // third_parties

  if (!collection.fields.getByName("rut_pdf")) {
    collection.fields.addAt(collection.fields.length, new Field({
      "id":          "file1784100001",
      "name":        "rut_pdf",
      "type":        "file",
      "system":      false,
      "required":    false,
      "hidden":      false,
      "presentable": false,
      "protected":   false,
      "maxSelect":   1,
      "maxSize":     15728640,
      "mimeTypes":   ["application/pdf"],
      "thumbs":      []
    }));
    return app.save(collection);
  }

  return null;
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_955284662"); // third_parties
  try {
    collection.fields.removeById("file1784100001");
    return app.save(collection);
  } catch (e) {
    return null;
  }
});
