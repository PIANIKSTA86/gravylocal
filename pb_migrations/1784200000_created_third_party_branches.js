/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    app.findCollectionByNameOrId("third_party_branches");
    return;
  } catch (_) {}

  const collection = new Collection({
    "id": "pbc_tp_branches",
    "name": "third_party_branches",
    "type": "base",
    "system": false,
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')",
    "updateRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')",
    "deleteRule": "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_id_tpb",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_955284662",
        "help": "",
        "hidden": false,
        "id": "rel_tp_id_tpb",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "third_party_id",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_code_tpb",
        "name": "code",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_name_tpb",
        "name": "name",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool_is_main_tpb",
        "name": "is_main",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_country_tpb",
        "name": "country",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_department_tpb",
        "name": "department",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_dept_code_tpb",
        "name": "dept_code",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_city_tpb",
        "name": "city",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_city_code_tpb",
        "name": "city_code",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_address_tpb",
        "name": "address",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_phone_tpb",
        "name": "phone",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_phone2_tpb",
        "name": "phone2",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "email_tpb",
        "name": "email",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "email"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_contact_tpb",
        "name": "contact_name",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_advisor_tpb",
        "name": "advisor",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_advisor_name_tpb",
        "name": "advisor_name",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "num_pi_tpb",
        "max": 100,
        "min": 0,
        "name": "pi",
        "noDecimal": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text_notes_tpb",
        "name": "notes",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool_active_tpb",
        "name": "active",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_tp_branches_tp` ON `third_party_branches` (`third_party_id`)",
      "CREATE INDEX `idx_tp_branches_code` ON `third_party_branches` (`third_party_id`, `code`)"
    ]
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("third_party_branches");
    app.delete(collection);
  } catch (_) {}
});
