/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let poCol;
  try {
    poCol = app.findCollectionByNameOrId("purchase_orders");
  } catch (_) {}

  if (!poCol) {
    poCol = new Collection({
      "id": "pbc_purchase_orders",
      "name": "purchase_orders",
      "type": "base",
      "system": false,
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.id != ''",
      "deleteRule": "@request.auth.id != ''",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text_id_po",
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
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_num_po",
          "name": "number",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_955284662",
          "help": "",
          "hidden": false,
          "id": "rel_supp_po",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "supplier_id",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_1364849191",
          "help": "",
          "hidden": false,
          "id": "rel_wh_po",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "warehouse_id",
          "presentable": true,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_date_po",
          "name": "date",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_due_po",
          "name": "due_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_notes_po",
          "name": "notes",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_sub_po",
          "max": null,
          "min": null,
          "name": "subtotal",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_iva_po",
          "max": null,
          "min": null,
          "name": "iva_total",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_disc_po",
          "max": null,
          "min": null,
          "name": "discount_amount",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_tot_po",
          "max": null,
          "min": null,
          "name": "total",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "sel_status_po",
          "maxSelect": 1,
          "name": "status",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "select",
          "values": ["pending", "invoiced", "cancelled"]
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_3726714070",
          "help": "",
          "hidden": false,
          "id": "rel_inv_po",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "invoice_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "_pb_users_auth_",
          "help": "",
          "hidden": false,
          "id": "rel_user_po",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "user_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_2536409462",
          "help": "",
          "hidden": false,
          "id": "rel_branch_po",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "branch_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        }
      ],
      "indexes": [
        "CREATE INDEX `idx_po_supplier` ON `purchase_orders` (`supplier_id`)",
        "CREATE INDEX `idx_po_status` ON `purchase_orders` (`status`)",
        "CREATE INDEX `idx_po_date` ON `purchase_orders` (`date`)"
      ]
    });
    app.save(poCol);
  }

  let polCol;
  try {
    polCol = app.findCollectionByNameOrId("purchase_order_lines");
  } catch (_) {}

  if (!polCol) {
    const parentPo = app.findCollectionByNameOrId("purchase_orders");
    polCol = new Collection({
      "id": "pbc_purchase_order_lines",
      "name": "purchase_order_lines",
      "type": "base",
      "system": false,
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.id != ''",
      "deleteRule": "@request.auth.id != ''",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text_id_pol",
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
          "collectionId": parentPo.id,
          "help": "",
          "hidden": false,
          "id": "rel_poid_pol",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "purchase_order_id",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_order_pol",
          "max": null,
          "min": null,
          "name": "line_order",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_4092854851",
          "help": "",
          "hidden": false,
          "id": "rel_prod_pol",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "product_id",
          "presentable": true,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "help": "",
          "hidden": false,
          "id": "text_desc_pol",
          "name": "description",
          "presentable": true,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_qty_pol",
          "max": null,
          "min": 0,
          "name": "qty",
          "onlyInt": false,
          "presentable": false,
          "required": true,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_price_pol",
          "max": null,
          "min": 0,
          "name": "unit_price",
          "onlyInt": false,
          "presentable": false,
          "required": true,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_ivarate_pol",
          "max": null,
          "min": 0,
          "name": "iva_rate",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_ivaamt_pol",
          "max": null,
          "min": 0,
          "name": "iva_amount",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_sub_pol",
          "max": null,
          "min": 0,
          "name": "subtotal",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "help": "",
          "hidden": false,
          "id": "num_tot_pol",
          "max": null,
          "min": 0,
          "name": "total",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        }
      ],
      "indexes": [
        "CREATE INDEX `idx_pol_poid` ON `purchase_order_lines` (`purchase_order_id`)",
        "CREATE INDEX `idx_pol_prod` ON `purchase_order_lines` (`product_id`)"
      ]
    });
    app.save(polCol);
  }
}, (app) => {
  try {
    const polCol = app.findCollectionByNameOrId("purchase_order_lines");
    app.delete(polCol);
  } catch (_) {}
  try {
    const poCol = app.findCollectionByNameOrId("purchase_orders");
    app.delete(poCol);
  } catch (_) {}
});
