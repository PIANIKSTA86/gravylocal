/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("dian_resolutions");
  if (!collection) return;

  const typeField = collection.fields.getByName("document_type");
  if (typeField) {
    const oldVals = typeField.values || [];
    const valsArray = [];
    for (let i = 0; i < oldVals.length; i++) {
      valsArray.push(oldVals[i]);
    }
    const needed = ["FV", "POS", "DS", "NE", "NC", "ND", "NDS", "NANE"];
    for (let j = 0; j < needed.length; j++) {
      if (valsArray.indexOf(needed[j]) === -1) {
        valsArray.push(needed[j]);
      }
    }
    typeField.values = valsArray;
    app.save(collection);
  }
}, (app) => {
  // no-op revert
});

