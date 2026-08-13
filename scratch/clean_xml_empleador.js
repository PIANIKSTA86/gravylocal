const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('pb_data', 'data.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, xml_generado FROM electronic_payrolls", [], (err, rows) => {
  if (err) return console.error(err);
  rows.forEach(r => {
    if (r.xml_generado && r.xml_generado.includes('PrimerApellido=""')) {
      const fixedXml = r.xml_generado.replace(/ PrimerApellido="" SegundoApellido="" PrimerNombre=""/g, '');
      db.run("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?", [fixedXml, r.id], (uErr) => {
        if (uErr) console.error("Error updating XML for id", r.id, uErr);
        else console.log("Removed empty surname attributes in XML for id:", r.id);
      });
    }
  });
  setTimeout(() => db.close(), 1000);
});
