const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../pb_data/data.db");
const db = new sqlite3.Database(dbPath);

db.get("SELECT * FROM _collections WHERE name = ?", ["import_pallet_configs"], (err, palletCol) => {
  if (err || !palletCol) {
    console.error("Error reading import_pallet_configs:", err);
    return;
  }
  
  db.get("SELECT * FROM _collections WHERE name = ?", ["import_lot_configs"], (err, existing) => {
    if (existing) {
      console.log("import_lot_configs already exists in _collections!");
      return;
    }
    
    const fields = [
      { autogeneratePattern: "[a-z0-9]{15}", help: "", hidden: false, id: "text3208210256", max: 15, min: 15, name: "id", pattern: "^[a-z0-9]+$", presentable: false, primaryKey: true, required: true, system: true, type: "text" },
      { cascadeDelete: true, collectionId: "pbc_3922105078", help: "", hidden: false, id: "rel_imp_id", maxSelect: 1, minSelect: 0, name: "import_id", presentable: false, required: true, system: false, type: "relation" },
      { cascadeDelete: true, collectionId: "pbc_4123813726", help: "", hidden: false, id: "rel_line_id", maxSelect: 1, minSelect: 0, name: "import_line_id", presentable: false, required: false, system: false, type: "relation" },
      { cascadeDelete: false, collectionId: "pbc_4092854851", help: "", hidden: false, id: "rel_prod_id", maxSelect: 1, minSelect: 0, name: "product_id", presentable: false, required: true, system: false, type: "relation" },
      { autogeneratePattern: "", help: "", hidden: false, id: "text_lot_num", max: 0, min: 0, name: "lot_number", pattern: "", presentable: false, primaryKey: false, required: true, system: false, type: "text" },
      { help: "", hidden: false, id: "num_qty", max: null, min: 0.001, name: "qty", onlyInt: false, presentable: false, required: true, system: false, type: "number" },
      { autogeneratePattern: "", help: "", hidden: false, id: "text_mfg_date", max: 0, min: 0, name: "manufacturing_date", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", help: "", hidden: false, id: "text_exp_date", max: 0, min: 0, name: "expiry_date", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", help: "", hidden: false, id: "text_notes", max: 0, min: 0, name: "notes", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { hidden: false, id: "autodate2990389176", name: "created", onCreate: true, onUpdate: false, presentable: false, system: false, type: "autodate" },
      { hidden: false, id: "autodate3332085495", name: "updated", onCreate: true, onUpdate: true, presentable: false, system: false, type: "autodate" }
    ];

    const colId = "pbc_imp_lot_cfg";
    const indexes = JSON.stringify(["CREATE INDEX IF NOT EXISTS idx_imp_lot_cfg ON import_lot_configs (import_id)"]);

    db.run(
      "INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated) VALUES (?, 0, 'base', 'import_lot_configs', ?, ?, ?, ?, ?, ?, ?, '{}', datetime('now'), datetime('now'))",
      [colId, JSON.stringify(fields), indexes, palletCol.listRule, palletCol.viewRule, palletCol.createRule, palletCol.updateRule, palletCol.deleteRule],
      function(err) {
        if (err) {
          console.error("Error inserting _collections:", err);
          return;
        }
        console.log("Collection import_lot_configs inserted into _collections.");
        
        db.run(`
          CREATE TABLE IF NOT EXISTS import_lot_configs (
            id TEXT PRIMARY KEY NOT NULL,
            import_id TEXT NOT NULL,
            import_line_id TEXT DEFAULT '',
            product_id TEXT NOT NULL,
            lot_number TEXT NOT NULL,
            qty NUMERIC NOT NULL DEFAULT 0,
            manufacturing_date TEXT DEFAULT '',
            expiry_date TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            created TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
            updated TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now'))
          );
        `, (err) => {
          if (err) console.error("Error creating table:", err);
          else {
            console.log("Table import_lot_configs created successfully.");
            db.run("CREATE INDEX IF NOT EXISTS idx_imp_lot_cfg ON import_lot_configs (import_id);", (err) => {
              if (err) console.error("Error creating index:", err);
              else console.log("Index created successfully.");
            });
          }
        });
      }
    );
  });
});
