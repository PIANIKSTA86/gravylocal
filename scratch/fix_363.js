const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const rec363 = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 363 AND ano = 2026 AND mes = 8").get();
if (rec363) {
  let xml = rec363.xml_generado;
  xml = xml.replace(/Deduccion="81284\.2643"/g, 'Deduccion="81284.26"');
  db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(xml, rec363.id);
  console.log('✓ Corregido redondeo en NOM-363 (Juan Andrés Caicedo - Ago 2026)');
}
