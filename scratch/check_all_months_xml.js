const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT mes, consecutivo, xml_generado FROM electronic_payrolls ORDER BY id ASC LIMIT 20").all();
rows.forEach(r => {
  const m = (r.xml_generado || '').match(/<Periodo[^>]*>/i);
  console.log(`Mes ${r.mes} NOM-${r.consecutivo}: ${m ? m[0] : 'NO'}`);
});

