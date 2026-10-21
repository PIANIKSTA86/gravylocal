/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3726714070")

  const fieldsConfig = [
    { name: "status_dian", id: "text_status_dian", max: 50 },
    { name: "cuds", id: "text_cuds", max: 500 },
    { name: "dian_response", id: "text_dian_response", max: 100000 },
    { name: "xml_content", id: "text_xml_content", max: 1000000 }
  ];

  for (const cfg of fieldsConfig) {
    const existing = collection.fields.getByName(cfg.name);
    if (existing) {
      existing.max = cfg.max;
    } else {
      collection.fields.add(new Field({
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": cfg.id,
        "max": cfg.max,
        "min": 0,
        "name": cfg.name,
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }));
    }
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3726714070")

  collection.fields.removeByName("status_dian")
  collection.fields.removeByName("cuds")
  collection.fields.removeByName("dian_response")
  collection.fields.removeByName("xml_content")

  return app.save(collection)
})
