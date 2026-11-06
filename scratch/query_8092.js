const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8092/pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening db:", err);
    process.exit(1);
  }
});

function runQueries() {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    console.log('--- TABLES (filtered) ---');
    if (err) console.error(err);
    else console.log(tables.map(t => t.name).filter(n => n.includes('dian') || n.includes('resol') || n.includes('sett') || n.includes('einvoice')));

    db.all("SELECT * FROM dian_resolutions", (err, resolutions) => {
      console.log('\n--- DIAN RESOLUTIONS ---');
      if (err) console.error(err.message);
      else console.log(JSON.stringify(resolutions, null, 2));

      db.all("SELECT * FROM settings WHERE key LIKE '%dian%' OR key LIKE '%matias%' OR key LIKE '%ftech%' OR key LIKE '%einvoice%'", (err, settings) => {
        console.log('\n--- SETTINGS ---');
        if (err) console.error(err.message);
        else console.log(JSON.stringify(settings, null, 2));

        db.all("SELECT * FROM dian_logs ORDER BY created DESC LIMIT 5", (err, logs) => {
          console.log('\n--- DIAN LOGS ---');
          if (err) console.error("Error in dian_logs query:", err.message);
          else console.log(JSON.stringify(logs, null, 2));

          db.all("SELECT * FROM transactions WHERE id = 'cni9njlt5wvhoqb'", (err, txs) => {
            console.log('\n--- TX cni9njlt5wvhoqb ---');
            if (err) console.error(err.message);
            else console.log(JSON.stringify(txs, null, 2));

            db.all("SELECT * FROM invoices WHERE tx_id = 'cni9njlt5wvhoqb'", (err, invs) => {
              console.log('\n--- INVOICE FOR TX ---');
              if (err) console.error(err.message);
              else console.log(JSON.stringify(invs, null, 2));

              db.all("SELECT * FROM einvoice_docs WHERE tx_id = 'cni9njlt5wvhoqb'", (err, docs) => {
                console.log('\n--- EINVOICE_DOCS ---');
                if (err) console.error(err.message);
                else console.log(JSON.stringify(docs, null, 2));

                db.close();
              });
            });
          });
        });
      });
    });
  });
}

runQueries();
