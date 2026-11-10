const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare(`
  SELECT ep.consecutivo, tp.name, ep.xml_generado, ep.employee_id
  FROM electronic_payrolls ep
  LEFT JOIN third_parties tp ON ep.employee_id = tp.id
  WHERE ep.mes = 9 AND ep.ano = 2026
  ORDER BY ep.consecutivo ASC
`).all();

rows.forEach(r => {
  const m = (r.xml_generado || '').match(/<Periodo[^>]*>/i);
  console.log(`NOM-${r.consecutivo} (${r.name}, empId: ${r.employee_id}): ${m ? m[0] : 'NO PERIODO'}`);
});

