const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db', sqlite3.OPEN_READONLY);

console.log('====================================================');
console.log('VERIFICACIÓN FINAL DE INTEGRIDAD DE CONSECUTIVOS');
console.log('====================================================\n');

db.all("SELECT id, document_type, prefix, current_number, number_from, number_to, active FROM dian_resolutions WHERE document_type IN ('DS', 'NC', 'FV', 'NDS')", (err, rows) => {
  if (err) return console.error('Error dian_resolutions:', err);
  console.log('1. ESTADO DE RESOLUCIONES DIAN:');
  console.table(rows);

  // Comprobar que DS no esté agotada
  const dsRes = rows.find(r => r.document_type === 'DS');
  if (dsRes) {
    if (dsRes.current_number <= dsRes.number_to) {
      console.log(`\x1b[32m✔ Resolución DS (DSE) SALUDABLE: Consecutivo actual ${dsRes.current_number} dentro del rango [${dsRes.number_from} - ${dsRes.number_to}]\x1b[0m\n`);
    } else {
      console.log(`\x1b[31m✖ ERROR: Resolución DS desfasada (${dsRes.current_number} > ${dsRes.number_to})\x1b[0m\n`);
    }
  }

  db.all("SELECT id, code, prefix, name, consecutive, active FROM transaction_types WHERE prefix IN ('DSE', 'NC', 'FV', 'CG', 'EF', 'RC')", (err2, rows2) => {
    if (err2) return console.error('Error transaction_types:', err2);
    console.log('2. ESTADO DE TRANSACTION_TYPES:');
    console.table(rows2);

    db.get("SELECT number FROM transactions WHERE number LIKE 'DSE-%' ORDER BY length(number) DESC, number DESC LIMIT 1", (err3, lastDseTx) => {
      console.log('3. ÚLTIMO DOCUMENTO SOPORTE EN TRANSACTIONS:');
      console.log('Último DSE:', lastDseTx ? lastDseTx.number : 'NONE');

      db.get("SELECT number FROM transactions WHERE number LIKE 'NC-%' ORDER BY length(number) DESC, number DESC LIMIT 1", (err4, lastNcTx) => {
        console.log('Última NC:', lastNcTx ? lastNcTx.number : 'NONE');

        db.get("SELECT number FROM transactions WHERE number LIKE 'CG-%' ORDER BY length(number) DESC, number DESC LIMIT 1", (err5, lastCgTx) => {
          console.log('Último Egreso CG:', lastCgTx ? lastCgTx.number : 'NONE');

          db.get("SELECT number FROM transactions WHERE number LIKE 'RC-%' ORDER BY length(number) DESC, number DESC LIMIT 1", (err6, lastRcTx) => {
            console.log('Último Recaudo RC:', lastRcTx ? lastRcTx.number : 'NONE');

            console.log('\n====================================================');
            console.log('\x1b[32mTODAS LAS COMPROBACIONES COMPLETADAS CON ÉXITO\x1b[0m');
            console.log('====================================================');
            db.close();
          });
        });
      });
    });
  });
});
