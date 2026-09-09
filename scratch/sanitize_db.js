const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db', sqlite3.OPEN_READWRITE);

db.serialize(() => {
  // 1. Eliminar registros de prueba con TEMP- en purchase_invoices
  db.run("DELETE FROM purchase_invoices WHERE number LIKE 'TEMP-%'", function(err) {
    if (err) console.error('Error borrando TEMP-:', err);
    else console.log('Registros TEMP- borrados en purchase_invoices:', this.changes);
  });

  // 2. Corregir dian_resolutions para DS (prefijo DSE) a 310
  db.run("UPDATE dian_resolutions SET current_number = 310 WHERE document_type = 'DS' AND prefix = 'DSE'", function(err) {
    if (err) console.error('Error actualizando dian_resolutions DS:', err);
    else console.log('dian_resolutions DS actualizado a 310. Cambios:', this.changes);
  });

  // 3. Corregir dian_resolutions para NC a 459
  db.run("UPDATE dian_resolutions SET current_number = 459 WHERE document_type = 'NC' AND prefix = 'NC'", function(err) {
    if (err) console.error('Error actualizando dian_resolutions NC:', err);
    else console.log('dian_resolutions NC actualizado a 459. Cambios:', this.changes);
  });

  // 4. Corregir transaction_types para DSE (prefijo DSE) a 310
  db.run("UPDATE transaction_types SET consecutive = 310 WHERE prefix = 'DSE'", function(err) {
    if (err) console.error('Error actualizando transaction_types DSE:', err);
    else console.log('transaction_types DSE actualizado a 310. Cambios:', this.changes);
  });

  // 5. Verificar estado final
  db.all("SELECT id, document_type, prefix, current_number, number_from, number_to FROM dian_resolutions WHERE document_type IN ('DS', 'NC')", (err, rows) => {
    console.log('Resoluciones DIAN corregidas:');
    console.table(rows);
  });

  db.all("SELECT id, code, prefix, name, consecutive FROM transaction_types WHERE prefix IN ('DSE', 'NC')", (err, rows) => {
    console.log('Tipos de transacción corregidos:');
    console.table(rows);
  });
});

setTimeout(() => db.close(), 1500);
