/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const targetCols = ["invoices", "sales_orders", "purchase_invoices"];

  targetCols.forEach(colName => {
    try {
      const col = app.findCollectionByNameOrId(colName);
      if (col && !col.fields.getByName("third_party_branch_id")) {
        col.fields.addAt(col.fields.length, new Field({
          "cascadeDelete": false,
          "collectionId": "pbc_tp_branches",
          "help": "Sede o sucursal operativa del tercero asociada a esta transacción",
          "hidden": false,
          "id": `rel_tpb_${colName.substring(0, 4)}`,
          "maxSelect": 1,
          "minSelect": 0,
          "name": "third_party_branch_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        }));
        app.save(col);
      }
    } catch (e) {
      console.warn(`Could not add third_party_branch_id to ${colName}:`, e);
    }
  });

  return null;
}, (app) => {
  const targetCols = ["invoices", "sales_orders", "purchase_invoices"];
  targetCols.forEach(colName => {
    try {
      const col = app.findCollectionByNameOrId(colName);
      if (col) {
        col.fields.removeById(`rel_tpb_${colName.substring(0, 4)}`);
        app.save(col);
      }
    } catch (_) {}
  });
  return null;
});
