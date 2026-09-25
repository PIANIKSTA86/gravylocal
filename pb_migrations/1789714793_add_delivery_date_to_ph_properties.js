/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4259671506"); // ph_properties

  if (!collection.fields.getByName("delivery_date")) {
    collection.fields.addAt(collection.fields.length, new Field({
      "autogeneratePattern": "",
      "help": "Fecha de entrega material del inmueble para cobro proporcional de administración",
      "hidden": false,
      "id": "text1789714793",
      "max": 0,
      "min": 0,
      "name": "delivery_date",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    }));
    return app.save(collection);
  }

  return null;
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4259671506"); // ph_properties
  try {
    collection.fields.removeById("text1789714793");
    return app.save(collection);
  } catch (e) {
    return null;
  }
});
