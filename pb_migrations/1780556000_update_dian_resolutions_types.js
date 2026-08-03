/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("dian_resolutions");
  if (!collection) return;

  const typeField = collection.fields.getByName("document_type");
  if (typeField && typeField.type === "select") {
    const oldVals = typeField.values || [];
    const setVals = new Set([...oldVals, "NC", "ND"]);
    typeField.values = Array.from(setVals);
    app.save(collection);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("dian_resolutions");
  if (!collection) return;

  const typeField = collection.fields.getByName("document_type");
  if (typeField && typeField.type === "select") {
    const oldVals = typeField.values || [];
    typeField.values = oldVals.filter(v => v !== "NC" && v !== "ND");
    app.save(collection);
  }
});
