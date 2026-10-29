const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

console.log('=== SANEAMIENTO DE REGISTROS HISTORICOS EN electronic_payrolls ===\n');

// 1. NOM-348 (2026-07, Cielo Aldana)
const rec348 = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 348 AND ano = 2026 AND mes = 7").get();
if (rec348 && !rec348.xml_generado.includes('Auxilios')) {
  let xml = rec348.xml_generado;
  const auxNode = '  <Auxilios><Auxilio AuxilioS="0.00" AuxilioNS="80000.00" /></Auxilios>\n';
  xml = xml.replace('</Devengados>', `${auxNode}</Devengados>`);
  db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(xml, rec348.id);
  console.log('✓ Corregido NOM-348 (Cielo Aldana - Jul 2026): Agregado Auxilio de Rodamiento $80.000');
}

// 2. NOM-353 (2026-07, Catalina Martínez)
const rec353 = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 353 AND ano = 2026 AND mes = 7").get();
if (rec353) {
  let xml = rec353.xml_generado;
  if (!xml.includes('Gasto de representacion') && !xml.includes('1430000')) {
    const grNode = '  <OtrosConceptos><OtroConcepto DescripcionConcepto="Gasto de representacion" ConceptoS="0.00" ConceptoNS="1430000.00" /></OtrosConceptos>\n';
    xml = xml.replace('</Devengados>', `${grNode}</Devengados>`);
  }
  // Eliminar Deuda duplicada si existe
  xml = xml.replace(/<Deuda>142473\.38<\/Deuda>\s*/g, '');
  xml = xml.replace(/<OtraDeduccion>142473\.38<\/OtraDeduccion>\s*/g, '');
  db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(xml, rec353.id);
  console.log('✓ Corregido NOM-353 (Catalina Martínez - Jul 2026): Agregado Gastos Rep $1.430.000 y eliminada Deuda duplicada');
}

// 3. NOM-360 (2026-08, Catalina Martínez)
const rec360 = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 360 AND ano = 2026 AND mes = 8").get();
if (rec360) {
  let xml = rec360.xml_generado;
  if (xml.includes('22178.00') && !xml.includes('<RetencionFuente>')) {
    xml = xml.replace(/<OtrasDeducciones><OtraDeduccion>22178\.00<\/OtraDeduccion><\/OtrasDeducciones>/g, '<RetencionFuente>22073.58</RetencionFuente>');
    xml = xml.replace(/<Deuda>22178\.00<\/Deuda>/g, '<RetencionFuente>22073.58</RetencionFuente>');
    db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(xml, rec360.id);
    console.log('✓ Corregido NOM-360 (Catalina Martínez - Ago 2026): Reclasificada retención a <RetencionFuente>');
  }
}

// 4. NOM-368 (2026-09, Cielo Aldana)
const rec368 = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 368 AND ano = 2026 AND mes = 9").get();
if (rec368 && !rec368.xml_generado.includes('Auxilios')) {
  let xml = rec368.xml_generado;
  const auxNode = '  <Auxilios><Auxilio AuxilioS="0.00" AuxilioNS="80000.00" /></Auxilios>\n';
  xml = xml.replace('</Devengados>', `${auxNode}</Devengados>`);
  db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(xml, rec368.id);
  console.log('✓ Corregido NOM-368 (Cielo Aldana - Sep 2026): Agregado Auxilio de Rodamiento $80.000');
}

// 5. NOM-371 (2026-09, Catalina Martínez)
const rec371 = db.prepare("SELECT * FROM electronic_payrolls WHERE consecutivo = 371 AND ano = 2026 AND mes = 9").get();
if (rec371) {
  let xml = rec371.xml_generado;
  if (!xml.includes('Gasto de representacion') && !xml.includes('2000000')) {
    const grNode = '  <OtrosConceptos><OtroConcepto DescripcionConcepto="Gasto de representacion" ConceptoS="0.00" ConceptoNS="2000000.00" /></OtrosConceptos>\n';
    xml = xml.replace('</Devengados>', `${grNode}</Devengados>`);
  }
  // Eliminar Deuda duplicada de $98000.86
  xml = xml.replace(/<Deuda>98000\.86<\/Deuda>\s*/g, '');
  xml = xml.replace(/<OtraDeduccion>98000\.86<\/OtraDeduccion>\s*/g, '');
  db.prepare("UPDATE electronic_payrolls SET xml_generado = ? WHERE id = ?").run(xml, rec371.id);
  console.log('✓ Corregido NOM-371 (Catalina Martínez - Sep 2026): Agregado Gastos Rep $2.000.000 y eliminada Deuda duplicada');
}
