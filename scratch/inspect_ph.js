const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const candidates = [
  './pb_data/data.db',
  './empresas/pb_data/data.db',
  './empresas/empresa_8091/pb_data/data.db',
  './empresas/empresa_8092/pb_data/data.db',
  './empresas/empresa_8093/pb_data/data.db',
  './empresas/empresa_8094/pb_data/data.db',
];

candidates.forEach(dbPath => {
  if (fs.existsSync(dbPath)) {
    const db = new sqlite3.Database(dbPath);
    db.all("SELECT id, number, period, property_id, date, due_date, total, status FROM ph_invoices WHERE number LIKE '%CF-202609%' LIMIT 1", (err, rows) => {
      if (!err && rows && rows.length) {
        console.log('FOUND IN:', dbPath, rows[0]);
        const inv = rows[0];
        db.all("SELECT * FROM ph_properties WHERE id = ?", [inv.property_id], (err2, props) => {
          console.log('Property:', props[0]);
          if (props && props.length && props[0].owner_id) {
            db.all("SELECT * FROM third_parties WHERE id = ?", [props[0].owner_id], (err3, owners) => {
              console.log('Owner fields:', owners[0]);
            });
          }
        });

        db.all("SELECT status, count(*), sum(total) FROM ph_invoices WHERE period = '2026-08' GROUP BY status", (err4, rSummary) => {
          console.log('2026-08 Summary:', rSummary);
        });

        db.all("SELECT * FROM ph_invoices WHERE property_id = ? AND period = '2026-08'", [inv.property_id], (err5, prevUnit) => {
          console.log('2026-08 Unit Invoice:', prevUnit);
        });
      }
    });
  }
});
