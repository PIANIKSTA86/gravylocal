/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Modificar colección 'products'
  const products = app.findCollectionByNameOrId("pbc_4092854851");
  let productsUpdated = false;

  if (!products.fields.getByName("is_consigned")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "bool3100000000",
      "name": "is_consigned",
      "type": "bool",
      "system": false,
      "required": false,
      "hidden": false
    }));
    productsUpdated = true;
  }

  if (!products.fields.getByName("consignment_supplier_id")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "relation3100000000",
      "name": "consignment_supplier_id",
      "type": "relation",
      "system": false,
      "required": false,
      "hidden": false,
      "collectionId": "pbc_955284662", // third_parties
      "maxSelect": 1,
      "minSelect": 0,
      "cascadeDelete": false
    }));
    productsUpdated = true;
  }

  if (!products.fields.getByName("consignment_cost")) {
    products.fields.addAt(products.fields.length, new Field({
      "id": "number3100000000",
      "name": "consignment_cost",
      "type": "number",
      "system": false,
      "required": false,
      "hidden": false,
      "min": 0
    }));
    productsUpdated = true;
  }

  if (productsUpdated) {
    app.save(products);
  }

  // 2. Modificar colección 'warehouses'
  const warehouses = app.findCollectionByNameOrId("pbc_1364849191");
  let warehousesUpdated = false;

  if (!warehouses.fields.getByName("is_consignment")) {
    warehouses.fields.addAt(warehouses.fields.length, new Field({
      "id": "bool3100000001",
      "name": "is_consignment",
      "type": "bool",
      "system": false,
      "required": false,
      "hidden": false
    }));
    warehousesUpdated = true;
  }

  if (!warehouses.fields.getByName("consignment_type")) {
    warehouses.fields.addAt(warehouses.fields.length, new Field({
      "id": "select3100000000",
      "name": "consignment_type",
      "type": "select",
      "system": false,
      "required": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["INBOUND", "OUTBOUND"]
    }));
    warehousesUpdated = true;
  }

  if (!warehouses.fields.getByName("linked_third_party_id")) {
    warehouses.fields.addAt(warehouses.fields.length, new Field({
      "id": "relation3100000001",
      "name": "linked_third_party_id",
      "type": "relation",
      "system": false,
      "required": false,
      "hidden": false,
      "collectionId": "pbc_955284662", // third_parties
      "maxSelect": 1,
      "minSelect": 0,
      "cascadeDelete": false
    }));
    warehousesUpdated = true;
  }

  if (warehousesUpdated) {
    app.save(warehouses);
  }

  // 3. Crear colección 'consignment_settlements'
  let hasSettleCol = false;
  try {
    app.findCollectionByNameOrId("consignment_settlements");
    hasSettleCol = true;
  } catch (_) {}

  if (!hasSettleCol) {
    const consignmentSettlements = new Collection({
      "id": "pbc_consg_settl",
      "name": "consignment_settlements",
      "type": "base",
      "system": false,
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.id != ''",
      "deleteRule": "@request.auth.id != ''",
      "fields": [
        {
          "id": "text3100000000",
          "name": "id",
          "type": "text",
          "system": true,
          "required": true,
          "primaryKey": true,
          "autogeneratePattern": "[a-z0-9]{15}",
          "min": 15,
          "max": 15,
          "pattern": "^[a-z0-9]+$"
        },
        {
          "id": "text3100000001",
          "name": "number",
          "type": "text",
          "system": false,
          "required": true,
          "presentable": true
        },
        {
          "id": "select3100000001",
          "name": "type",
          "type": "select",
          "system": false,
          "required": true,
          "maxSelect": 1,
          "values": ["INBOUND", "OUTBOUND"]
        },
        {
          "id": "relation3100000002",
          "name": "third_party_id",
          "type": "relation",
          "system": false,
          "required": true,
          "collectionId": "pbc_955284662", // third_parties
          "maxSelect": 1,
          "minSelect": 1
        },
        {
          "id": "text3100000002",
          "name": "date",
          "type": "text",
          "system": false,
          "required": true
        },
        {
          "id": "select3100000002",
          "name": "status",
          "type": "select",
          "system": false,
          "required": true,
          "maxSelect": 1,
          "values": ["draft", "posted", "voided"]
        },
        {
          "id": "relation3100000003",
          "name": "invoice_id",
          "type": "relation",
          "system": false,
          "required": false,
          "collectionId": "pbc_711030668", // invoices
          "maxSelect": 1,
          "minSelect": 0
        },
        {
          "id": "relation3100000004",
          "name": "purchase_invoice_id",
          "type": "relation",
          "system": false,
          "required": false,
          "collectionId": "pbc_3726714070", // purchase_invoices
          "maxSelect": 1,
          "minSelect": 0
        },
        {
          "id": "relation3100000005",
          "name": "warehouse_id",
          "type": "relation",
          "system": false,
          "required": true,
          "collectionId": "pbc_1364849191", // warehouses
          "maxSelect": 1,
          "minSelect": 1
        },
        {
          "id": "relation3100000006",
          "name": "return_warehouse_id",
          "type": "relation",
          "system": false,
          "required": false,
          "collectionId": "pbc_1364849191", // warehouses
          "maxSelect": 1,
          "minSelect": 0
        },
        {
          "id": "relation3100000007",
          "name": "branch_id",
          "type": "relation",
          "system": false,
          "required": false,
          "collectionId": "pbc_2536409462", // branches
          "maxSelect": 1,
          "minSelect": 0
        },
        {
          "id": "text3100000003",
          "name": "notes",
          "type": "text",
          "system": false,
          "required": false
        }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX `idx_settlements_number` ON `consignment_settlements` (`number`)"
      ]
    });
    app.save(consignmentSettlements);
  }

  // 4. Crear colección 'consignment_settlement_lines'
  let hasLinesCol = false;
  try {
    app.findCollectionByNameOrId("consignment_settlement_lines");
    hasLinesCol = true;
  } catch (_) {}

  if (!hasLinesCol) {
    const consignmentSettlementLines = new Collection({
      "id": "pbc_consg_lines",
      "name": "consignment_settlement_lines",
      "type": "base",
      "system": false,
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.id != ''",
      "deleteRule": "@request.auth.id != ''",
      "fields": [
        {
          "id": "text3100000004",
          "name": "id",
          "type": "text",
          "system": true,
          "required": true,
          "primaryKey": true,
          "autogeneratePattern": "[a-z0-9]{15}",
          "min": 15,
          "max": 15,
          "pattern": "^[a-z0-9]+$"
        },
        {
          "id": "relation3100000008",
          "name": "settlement_id",
          "type": "relation",
          "system": false,
          "required": true,
          "collectionId": "pbc_consg_settl",
          "maxSelect": 1,
          "minSelect": 1,
          "cascadeDelete": true
        },
        {
          "id": "relation3100000009",
          "name": "product_id",
          "type": "relation",
          "system": false,
          "required": true,
          "collectionId": "pbc_4092854851", // products
          "maxSelect": 1,
          "minSelect": 1
        },
        {
          "id": "number3100000001",
          "name": "qty_sold",
          "type": "number",
          "system": false,
          "required": true
        },
        {
          "id": "number3100000002",
          "name": "qty_returned",
          "type": "number",
          "system": false,
          "required": true
        },
        {
          "id": "number3100000003",
          "name": "unit_cost",
          "type": "number",
          "system": false,
          "required": true
        },
        {
          "id": "number3100000004",
          "name": "subtotal",
          "type": "number",
          "system": false,
          "required": true
        }
      ]
    });
    app.save(consignmentSettlementLines);
  }

}, (app) => {
  // Reverso de migración
  try {
    const lines = app.findCollectionByNameOrId("consignment_settlement_lines");
    app.delete(lines);
  } catch (_) {}

  try {
    const settlements = app.findCollectionByNameOrId("consignment_settlements");
    app.delete(settlements);
  } catch (_) {}

  try {
    const warehouses = app.findCollectionByNameOrId("pbc_1364849191");
    warehouses.fields.removeById("bool3100000001");
    warehouses.fields.removeById("select3100000000");
    warehouses.fields.removeById("relation3100000001");
    app.save(warehouses);
  } catch (_) {}

  try {
    const products = app.findCollectionByNameOrId("pbc_4092854851");
    products.fields.removeById("bool3100000000");
    products.fields.removeById("relation3100000000");
    products.fields.removeById("number3100000000");
    app.save(products);
  } catch (_) {}
});
