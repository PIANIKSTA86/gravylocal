const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const emps = db.prepare(`
  SELECT DISTINCT ep.employee_id, tp.name, tp.doc_number
  FROM electronic_payrolls ep
  LEFT JOIN third_parties tp ON ep.employee_id = tp.id
  WHERE ep.mes = 9 AND ep.ano = 2026
`).all();

console.log('--- FECHAS DE INGRESO REGISTRADAS EN MESES 8 Y 10 ---');
emps.forEach(e => {
  const records = db.prepare(`
    SELECT ano, mes, consecutivo, xml_generado
    FROM electronic_payrolls
    WHERE employee_id = ?
    ORDER BY ano DESC, mes DESC
  `).all(e.employee_id);

  console.log(`\nEmpleado: ${e.name} (${e.doc_number}, id: ${e.employee_id})`);
  records.forEach(r => {
    const m = (r.xml_generado || '').match(/FechaIngreso="([^"]*)"/i);
    const tl = (r.xml_generado || '').match(/TiempoLaborado="([^"]*)"/i);
    console.log(`  Mes ${r.mes}/${r.ano} (NOM-${r.consecutivo}): FechaIngreso = ${m ? m[1] : 'NO'} | TiempoLaborado = ${tl ? tl[1] : 'NO'}`);
  });
});

