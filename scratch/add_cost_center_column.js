const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
  'empresas/pb_data/data.db'
];

async function addCostCenterToPurchaseInvoices(dbPath) {
  if (!fs.existsSync(dbPath)) return;
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath);
    db.all("PRAGMA table_info(purchase_invoices)", (err, cols) => {
      if (err) {
        console.error(`Error in ${dbPath}:`, err.message);
        db.close();
        return resolve();
      }
      const hasCc = cols.some(c => c.name === 'cost_center_id');
      if (hasCc) {
        console.log(`[${dbPath}] purchase_invoices already has cost_center_id.`);
        db.close();
        return resolve();
      }
      db.run("ALTER TABLE purchase_invoices ADD COLUMN cost_center_id TEXT DEFAULT ''", (aErr) => {
        if (aErr) {
          console.error(`Error adding col to ${dbPath}:`, aErr.message);
        } else {
          console.log(`[${dbPath}] Added cost_center_id to purchase_invoices table.`);
        }

        // Also update _collections schema json
        db.get("SELECT id, fields FROM _collections WHERE name='purchase_invoices'", (cErr, row) => {
          if (!cErr && row) {
            const fields = JSON.parse(row.fields);
            if (!fields.some(f => f.name === 'cost_center_id')) {
              db.get("SELECT id FROM _collections WHERE name='cost_centers'", (ccErr, ccRow) => {
                const ccColId = ccRow ? ccRow.id : '';
                fields.push({
                  id: "rel_cost_center_pur",
                  name: "cost_center_id",
                  type: "relation",
                  required: false,
                  collectionId: ccColId,
                  maxSelect: 1,
                  cascadeDelete: false
                });
                db.run("UPDATE _collections SET fields=? WHERE id=?", [JSON.stringify(fields), row.id], () => {
                  console.log(`[${dbPath}] Updated _collections fields for purchase_invoices.`);
                  db.close();
                  resolve();
                });
              });
              return;
            }
          }
          db.close();
          resolve();
        });
      });
    });
  });
}

async function run() {
  for (const d of dbs) {
    await addCostCenterToPurchaseInvoices(d);
  }
}

run();

