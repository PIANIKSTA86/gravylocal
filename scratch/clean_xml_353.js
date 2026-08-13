const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('pb_data', 'data.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, xml_generado FROM electronic_payrolls WHERE id = 'wamiehgm0btjfa8'", [], (err, rows) => {
  if (err) return console.error(err);
  rows.forEach(r => {
    if (r.xml_generado) {
      const fixedXml = r.xml_generado.replace(/<OtrasDeducciones><OtraDeduccion>(.*?)<\/OtraDeduccion><\/OtrasDeducciones>/g, '<Deuda>$1</Deuda>');
      db.run("UPDATE electronic_payrolls SET xml_generado = ?, estado_dian = 'PENDIENTE' WHERE id = ?", [fixedXml, r.id], (uErr) => {
        if (uErr) console.error("Error updating XML for id", r.id, uErr);
        else console.log("Updated OtrasDeducciones to Deuda in XML for NOM 353 (id:", r.id + ")");
      });
    }
  });
  setTimeout(() => db.close(), 1000);
});
