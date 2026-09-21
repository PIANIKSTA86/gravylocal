/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const txCol = app.findCollectionByNameOrId("transactions");
    if (txCol) {
      if (!txCol.fields.getByName("is_import")) {
        txCol.fields.addAt(txCol.fields.length, new Field({
          "name": "is_import",
          "type": "bool",
          "required": false,
          "system": false
        }));
      }
      if (!txCol.fields.getByName("import_id")) {
        txCol.fields.addAt(txCol.fields.length, new Field({
          "cascadeDelete": false,
          "collectionId": "pbc_3922105078",
          "name": "import_id",
          "maxSelect": 1,
          "minSelect": 0,
          "required": false,
          "system": false,
          "type": "relation"
        }));
      }
      if (!txCol.fields.getByName("import_invoice_ref")) {
        txCol.fields.addAt(txCol.fields.length, new Field({
          "name": "import_invoice_ref",
          "type": "text",
          "required": false,
          "system": false
        }));
      }
      if (!txCol.fields.getByName("import_trm")) {
        txCol.fields.addAt(txCol.fields.length, new Field({
          "name": "import_trm",
          "type": "number",
          "required": false,
          "system": false
        }));
      }
      app.save(txCol);
    }
  } catch (e) {
    console.warn("Could not update transactions collection fields:", e);
  }

  try {
    const linesCol = app.findCollectionByNameOrId("tx_lines");
    if (linesCol) {
      if (!linesCol.fields.getByName("import_id")) {
        linesCol.fields.addAt(linesCol.fields.length, new Field({
          "cascadeDelete": false,
          "collectionId": "pbc_3922105078",
          "name": "import_id",
          "maxSelect": 1,
          "minSelect": 0,
          "required": false,
          "system": false,
          "type": "relation"
        }));
      }
      if (!linesCol.fields.getByName("import_concept")) {
        linesCol.fields.addAt(linesCol.fields.length, new Field({
          "name": "import_concept",
          "type": "select",
          "required": false,
          "system": false,
          "maxSelect": 1,
          "values": ["fob", "freight", "insurance", "customs", "local_carrier", "local_other"]
        }));
      }
      if (!linesCol.fields.getByName("import_invoice_ref")) {
        linesCol.fields.addAt(linesCol.fields.length, new Field({
          "name": "import_invoice_ref",
          "type": "text",
          "required": false,
          "system": false
        }));
      }
      if (!linesCol.fields.getByName("import_trm")) {
        linesCol.fields.addAt(linesCol.fields.length, new Field({
          "name": "import_trm",
          "type": "number",
          "required": false,
          "system": false
        }));
      }
      app.save(linesCol);
    }
  } catch (e) {
    console.warn("Could not update tx_lines collection fields:", e);
  }

  return null;
}, (app) => {
  return null;
});
