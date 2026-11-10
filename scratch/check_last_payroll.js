const sqlite3 = require('better-sqlite3');
const db = new sqlite3('pb_data/data.db');

const settings = db.prepare("SELECT key, value FROM settings WHERE key LIKE '%einvoice%' OR key LIKE '%matias%' OR key LIKE '%dian%'").all();
console.log('Settings:', settings);

const lastPayroll = db.prepare("SELECT id, consecutivo, prefijo, estado_dian, cufe, xml_generado, respuesta_dian FROM electronic_payrolls ORDER BY updated DESC LIMIT 1").get();
if (lastPayroll) {
  console.log('Last payroll ID:', lastPayroll.id);
  console.log('Consecutivo:', lastPayroll.consecutivo);
  console.log('Estado DIAN:', lastPayroll.estado_dian);
  console.log('CUFE:', lastPayroll.cufe);
  console.log('Respuesta DIAN (full or first 1000):', (lastPayroll.respuesta_dian || '').slice(0, 1000));
  console.log('xml_generado length:', (lastPayroll.xml_generado || '').length);
  console.log('xml_generado starts with:', (lastPayroll.xml_generado || '').slice(0, 200));
} else {
  console.log('No payrolls found.');
}

