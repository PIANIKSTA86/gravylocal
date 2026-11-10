const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT id, consecutivo, prefijo, ano, mes, estado_dian, cufe, xml_generado FROM electronic_payrolls WHERE ano = 2026 AND (mes = 9 OR prefijo = 'NANE')").all();
console.log('Electronic payroll rows:');
rows.forEach(r => {
  const isJson = r.xml_generado && r.xml_generado.trim().startsWith('{');
  let type = 'XML';
  let pred = '';
  if (isJson) {
    try {
      const p = JSON.parse(r.xml_generado);
      type = p.payroll_type || 'standard';
      pred = p.deleting_predecessor?.number || p.relevant_predecessor?.number || '';
    } catch (_) {}
  }
  console.log(`- ID: ${r.id} | ${r.prefijo}-${r.consecutivo} | M:${r.mes} | Estado: ${r.estado_dian} | Type: ${type} | Pred: ${pred} | CUFE: ${r.cufe ? r.cufe.slice(0, 15) + '...' : 'none'}`);
});

