const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const neList = db.prepare(`
  SELECT ne.*, tp.name as emp_name, tp.doc_number 
  FROM electronic_payrolls ne
  LEFT JOIN third_parties tp ON tp.id = ne.employee_id
  WHERE ne.ano = 2026 AND ne.mes IN (7, 8, 9)
  ORDER BY ne.mes, ne.consecutivo
`).all();

console.log('=== AUDITORIA COMPLETA DE SUMA XML VS ENCABEZADOS NE ===\n');

let totalDiscrepancies = 0;

for (const ne of neList) {
  const xml = ne.xml_generado;

  // Extract all devengados
  const basicoMatch = xml.match(/<Basico DiasTrabajados="([^"]*)" SueldoTrabajado="([^"]*)"/);
  const transpMatch = xml.match(/<Transporte AuxilioTransporte="([^"]*)"/);
  const comisionMatch = xml.match(/<Comision>([^<]*)<\/Comision>/);
  const bonifMatch = xml.match(/<Bonificacion BonificacionS="([^"]*)"/);
  const auxNSMatch = xml.match(/<Auxilio[^>]*AuxilioNS="([^"]*)"/);
  
  // Extract all OT amounts
  let otSum = 0;
  const otMatches = xml.matchAll(/<(?:HED|HEN|HRN|HEDDF|HRDF|HRDDF|HENDF|HRNDF)[^>]*Pago="([^"]*)"/g);
  for (const m of otMatches) {
    otSum += Number(m[1] || 0);
  }

  // Extract all OtrosConceptos
  let otrosConceptosSum = 0;
  const ocMatches = xml.matchAll(/<OtroConcepto[^>]*ConceptoNS="([^"]*)"/g);
  for (const m of ocMatches) {
    otrosConceptosSum += Number(m[1] || 0);
  }
  const ocMatchesS = xml.matchAll(/<OtroConcepto[^>]*ConceptoS="([^"]*)"/g);
  for (const m of ocMatchesS) {
    otrosConceptosSum += Number(m[1] || 0);
  }

  // Extract all deducciones
  const saludMatch = xml.match(/<Salud Porcentaje="[^"]*" Deduccion="([^"]*)"/);
  const pensionMatch = xml.match(/<FondoPension Porcentaje="[^"]*" Deduccion="([^"]*)"/);
  const fspMatch = xml.match(/<FondoSP Porcentaje="[^"]*" DeduccionSP="([^"]*)"/);
  const retMatch = xml.match(/<RetencionFuente>([^<]*)<\/RetencionFuente>/);
  const deudaMatch = xml.match(/<Deuda>([^<]*)<\/Deuda>/) || xml.match(/<OtraDeduccion>([^<]*)<\/OtraDeduccion>/);

  const devengosXmlSum = Math.round((
    Number(basicoMatch?.[2] || 0) +
    Number(transpMatch?.[1] || 0) +
    Number(comisionMatch?.[1] || 0) +
    Number(bonifMatch?.[1] || 0) +
    Number(auxNSMatch?.[1] || 0) +
    otSum +
    otrosConceptosSum
  ) * 100) / 100;

  const deduccionesXmlSum = Math.round((
    Number(saludMatch?.[1] || 0) +
    Number(pensionMatch?.[1] || 0) +
    Number(fspMatch?.[1] || 0) +
    Number(retMatch?.[1] || 0) +
    Number(deudaMatch?.[1] || 0)
  ) * 100) / 100;

  const diffDev = Math.round((Number(ne.total_devengos) - devengosXmlSum) * 100) / 100;
  const diffDed = Math.round((Number(ne.total_deducciones) - deduccionesXmlSum) * 100) / 100;

  if (diffDev !== 0 || diffDed !== 0) {
    totalDiscrepancies++;
    console.log(`❌ [Mes ${ne.mes}] ${ne.prefijo}-${ne.consecutivo} | ${ne.emp_name}:`);
    console.log(`   Diff Devengos: ${diffDev} (Encabezado: ${ne.total_devengos} vs XML: ${devengosXmlSum})`);
    console.log(`   Diff Deducciones: ${diffDed} (Encabezado: ${ne.total_deducciones} vs XML: ${deduccionesXmlSum})`);
  } else {
    console.log(`✅ [Mes ${ne.mes}] ${ne.prefijo}-${ne.consecutivo} | ${ne.emp_name}: SUMAS XML Y ENCABEZADOS CUADRAN 100% ($${ne.total_devengos} / $${ne.total_deducciones})`);
  }
}

console.log(`\n============================================================`);
console.log(`Total volantes auditados: ${neList.length}`);
console.log(`Total discrepancias internas XML: ${totalDiscrepancies}`);
