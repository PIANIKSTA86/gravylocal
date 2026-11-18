/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const qLines = app.findCollectionByNameOrId("quotation_lines");
  if (qLines && !qLines.fields.getByName("item_notes")) {
    qLines.fields.add(new Field({
      "autogeneratePattern": "",
      "help": "Comentario o nota detallada del ítem",
      "hidden": false,
      "id": "text_item_notes",
      "max": 5000,
      "min": 0,
      "name": "item_notes",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    }));
    app.save(qLines);
  }

  const quotes = app.findCollectionByNameOrId("quotations");
  if (quotes && !quotes.fields.getByName("warehouse_id")) {
    quotes.fields.add(new Field({
      "cascadeDelete": false,
      "collectionId": "pbc_1364849191",
      "help": "Bodega asociada a la cotización",
      "hidden": false,
      "id": "rel_quote_wh",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "warehouse_id",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    }));
    app.save(quotes);
  }
}, (app) => {
  // no-op revert
});
