/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const products = app.findCollectionByNameOrId("pbc_4092854851");
  let productsUpdated = false;

  if (!products.fields.getByName("auto_calc_price")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "bool3400000000",
      "name": "auto_calc_price",
      "type": "bool",
      "system": false,
      "required": false,
      "hidden": false
    }));
    productsUpdated = true;
  }

  if (!products.fields.getByName("margin_factor")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "number3400000000",
      "name": "margin_factor",
      "type": "number",
      "system": false,
      "required": false,
      "hidden": false,
      "min": 0
    }));
    productsUpdated = true;
  }

  if (!products.fields.getByName("margin_type")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "select3400000000",
      "name": "margin_type",
      "type": "select",
      "system": false,
      "required": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["MARKUP_COST", "MARGIN_SALE", "FACTOR"]
    }));
    productsUpdated = true;
  }

  if (!products.fields.getByName("rounding_type")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "select3400000001",
      "name": "rounding_type",
      "type": "select",
      "system": false,
      "required": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["NONE", "NEAREST_10", "NEAREST_100", "NEAREST_1000", "CEIL_100", "CEIL_1000"]
    }));
    productsUpdated = true;
  }

  if (productsUpdated) {
    app.save(products);
  }
}, (app) => {
  const products = app.findCollectionByNameOrId("pbc_4092854851");
  let productsUpdated = false;

  if (products.fields.getByName("auto_calc_price")) {
    products.fields.removeById("bool3400000000");
    productsUpdated = true;
  }
  if (products.fields.getByName("margin_factor")) {
    products.fields.removeById("number3400000000");
    productsUpdated = true;
  }
  if (products.fields.getByName("margin_type")) {
    products.fields.removeById("select3400000000");
    productsUpdated = true;
  }
  if (products.fields.getByName("rounding_type")) {
    products.fields.removeById("select3400000001");
    productsUpdated = true;
  }

  if (productsUpdated) {
    app.save(products);
  }
});
