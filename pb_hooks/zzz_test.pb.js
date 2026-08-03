/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();
  try {
    const tpCol = $app.findCollectionByNameOrId("third_parties");
    if (tpCol) {
      console.log("THIRD_PARTIES FIELD NAMES:");
      const names = tpCol.fields.fieldNames();
      for (let i = 0; i < names.length; i++) {
        console.log("- " + names[i]);
      }
      
      const records = $app.findRecordsByFilter("third_parties", "1=1", "", 5, 0);
      console.log("THIRD_PARTIES RECORD COUNT: " + records.length);
      for (let i = 0; i < records.length; i++) {
        const rec = records[i];
        console.log("TP Record " + i + ": id=" + rec.id + ", name=" + rec.getString("name") + ", type=" + rec.getString("type"));
      }
    } else {
      console.log("Collection third_parties not found");
    }

    const cliCol = $app.findCollectionByNameOrId("clientes");
    if (cliCol) {
      const records = $app.findRecordsByFilter("clientes", "1=1", "", 5, 0);
      console.log("CLIENTES RECORD COUNT: " + records.length);
    }
  } catch (err) {
    console.log("INSPECT ERROR: " + err);
  }
});
