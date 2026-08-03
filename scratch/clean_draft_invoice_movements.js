const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

async function cleanDraftInvoices() {
  db.all("SELECT * FROM invoices WHERE status = 'draft' AND inv_movement_id != ''", (err, rows) => {
    if (err) {
      console.error("Error reading draft invoices:", err);
      db.close();
      return;
    }

    console.log(`Found ${rows.length} draft invoices with hanging inv_movement_id:`);
    rows.forEach(inv => {
      console.log(`- Invoice ${inv.number} (ID: ${inv.id}), inv_movement_id: ${inv.inv_movement_id}`);
      
      if (inv.inv_movement_id) {
        db.run("UPDATE inventory_movements SET status = 'voided' WHERE id = ?", [inv.inv_movement_id], function(err) {
          if (err) console.error("Error voiding movement:", err);
          else console.log(`  Voided movement ${inv.inv_movement_id}`);
        });

        db.run("UPDATE inventory_movements SET status = 'voided' WHERE notes LIKE ? AND status != 'voided'", [`%${inv.number}%`], function(err) {
          if (err) console.error("Error voiding related movements:", err);
          else console.log(`  Voided related movements for ${inv.number}`);
        });
      }

      db.run("UPDATE invoices SET inv_movement_id = '' WHERE id = ?", [inv.id], function(err) {
        if (err) console.error("Error clearing invoice inv_movement_id:", err);
        else console.log(`  Cleared inv_movement_id on invoice ${inv.number}`);
      });
    });

    setTimeout(() => {
      db.close();
      console.log("Cleanup completed.");
    }, 1000);
  });
}

cleanDraftInvoices();
