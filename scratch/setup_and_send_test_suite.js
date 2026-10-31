const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbPath = 'empresas/empresa_8092/pb_data/data.db';
const db = new DatabaseSync(dbPath);

const targetEmail = 'julian_piano@hotmail.com';

// 1. Ensure a Contractor / Non-obliged third party for Documento Soporte
let contractor = db.prepare("SELECT id FROM third_parties WHERE doc_number = '1037654321'").get();
if (!contractor) {
  const cId = 'ctrc' + Math.random().toString(36).substring(2, 13);
  db.prepare(`
    INSERT INTO third_parties (id, name, doc_type, doc_number, email, address, phone, type, active)
    VALUES (?, ?, 'CC', ?, ?, 'Carrera 43A # 1Sur-220, Medellín', '3001234567', 'PROVEEDOR', 1)
  `).run(cId, 'MARIA FERNANDA GOMEZ (ASESORA DE DISEÑO)', '1037654321', targetEmail);
  contractor = { id: cId };
  console.log('Created contractor third party:', cId);
} else {
  console.log('Contractor third party exists:', contractor.id);
}

// 2. Ensure Employee third party for Nómina
let employee = db.prepare("SELECT id FROM third_parties WHERE doc_number = '2000002362'").get();
if (!employee) {
  const eId = 'emp' + Math.random().toString(36).substring(2, 14);
  db.prepare(`
    INSERT INTO third_parties (id, name, doc_type, doc_number, email, address, phone, type, active)
    VALUES (?, ?, 'CC', ?, ?, 'CR 32B 25 24 BARRIO EL JARDIN', '3109876543', 'EMPLEADO', 1)
  `).run(eId, 'CARLOS ENRIQUE CORTEZ RIVAS', '2000002362', targetEmail);
  employee = { id: eId };
  console.log('Created employee third party:', eId);
} else {
  console.log('Employee third party exists:', employee.id);
}

// 3. Documento Soporte (DS-00000001)
const dsTxType = db.prepare("SELECT id FROM transaction_types WHERE code = 'DS'").get()?.id || 'txbfcgdj5rfed33';
let dsTx = db.prepare("SELECT id FROM transactions WHERE number = 'DS-00000001'").get();
if (!dsTx) {
  const txId = 'txds' + Math.random().toString(36).substring(2, 13);
  db.prepare(`
    INSERT INTO transactions (id, number, date, tx_type_id, third_party_id, description, status)
    VALUES (?, 'DS-00000001', '2026-10-31', ?, ?, 'Honorarios profesionales de diseño UX/UI', 'confirmed')
  `).run(txId, dsTxType, contractor.id);
  dsTx = { id: txId };

  const piId = 'pids' + Math.random().toString(36).substring(2, 13);
  db.prepare(`
    INSERT INTO purchase_invoices (id, tx_id, number, date, due_date, supplier_id, subtotal, iva_total, total, status)
    VALUES (?, ?, 'DS-00000001', '2026-10-31', '2026-10-31', ?, 1250000, 0, 1250000, 'confirmed')
  `).run(piId, txId, contractor.id);

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><cbc:CustomizationID>05</cbc:CustomizationID><cbc:ID>DS-00000001</cbc:ID><cbc:UUID schemeName="CUDE-SHA384">cude_ds_00000001_dian_test_colombia_987654321</cbc:UUID><cbc:IssueDate>2026-10-31</cbc:IssueDate></Invoice>`;
  db.prepare(`
    INSERT INTO einvoice_docs (id, tx_id, cufe, xml_content, status, sent_at)
    VALUES (?, ?, 'cude_ds_00000001_dian_test_colombia_987654321', ?, 'aceptada', '2026-10-31 12:00:00')
  `).run('eids' + Math.random().toString(36).substring(2, 13), txId, sampleXml);
  console.log('Created Documento Soporte DS-00000001 with txId:', txId);
} else {
  console.log('Documento Soporte DS-00000001 already exists with txId:', dsTx.id);
}

// 4. Nota de Ajuste al Documento Soporte (NDS-00000001)
const ndsTxType = db.prepare("SELECT id FROM transaction_types WHERE code = 'NDS'").get()?.id || '1lanqydlhi27bwe';
let ndsTx = db.prepare("SELECT id FROM transactions WHERE number = 'NDS-00000001'").get();
if (!ndsTx) {
  const txId = 'txnds' + Math.random().toString(36).substring(2, 12);
  db.prepare(`
    INSERT INTO transactions (id, number, date, tx_type_id, third_party_id, description, status)
    VALUES (?, 'NDS-00000001', '2026-10-31', ?, ?, 'Ajuste de valor por descuento convenido en honorarios', 'confirmed')
  `).run(txId, ndsTxType, contractor.id);
  ndsTx = { id: txId };

  const piId = 'pinds' + Math.random().toString(36).substring(2, 12);
  db.prepare(`
    INSERT INTO purchase_invoices (id, tx_id, number, date, due_date, supplier_id, subtotal, iva_total, total, status)
    VALUES (?, ?, 'NDS-00000001', '2026-10-31', '2026-10-31', ?, 250000, 0, 250000, 'confirmed')
  `).run(piId, txId, contractor.id);

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?><CreditNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"><cbc:CustomizationID>95</cbc:CustomizationID><cbc:ID>NDS-00000001</cbc:ID><cbc:UUID schemeName="CUDE-SHA384">cude_nds_00000001_dian_test_colombia_123456789</cbc:UUID><cbc:IssueDate>2026-10-31</cbc:IssueDate></CreditNote>`;
  db.prepare(`
    INSERT INTO einvoice_docs (id, tx_id, cufe, xml_content, status, sent_at)
    VALUES (?, ?, 'cude_nds_00000001_dian_test_colombia_123456789', ?, 'aceptada', '2026-10-31 12:05:00')
  `).run('einds' + Math.random().toString(36).substring(2, 12), txId, sampleXml);
  console.log('Created Nota de Ajuste DS NDS-00000001 with txId:', txId);
} else {
  console.log('Nota de Ajuste DS NDS-00000001 already exists with txId:', ndsTx.id);
}

// 5. Nómina Electrónica (NOM-00000001)
let nomRec = db.prepare("SELECT id FROM electronic_payrolls WHERE prefijo = 'NOM' AND consecutivo = 1").get();
const nomXml = `<?xml version="1.0" encoding="UTF-8"?>
<NominaIndividual xmlns="dian:gov:co:facturaelectronica:NominaIndividual">
  <InformacionGeneral TipoXML="102" CUNE="cune_nom_00000001_test_dian_colombia_555555555" />
  <Trabajador TipoTrabajador="01" PrimerApellido="CORTEZ" SegundoApellido="RIVAS" PrimerNombre="CARLOS" OtrosNombres="ENRIQUE" NumeroDocumento="2000002362" />
  <Devengados><Basico DiasTrabajados="30" SueldoTrabajado="2474203.28" /></Devengados>
  <Deducciones><Salud Deduccion="89004.33" /><FondoPension Deduccion="89004.33" /></Deducciones>
  <DevengadosTotal>2474203.28</DevengadosTotal>
  <DeduccionesTotal>178008.66</DeduccionesTotal>
  <ComprobanteTotal>2296194.62</ComprobanteTotal>
</NominaIndividual>`;

if (!nomRec) {
  const nomId = 'nom' + Math.random().toString(36).substring(2, 14);
  db.prepare(`
    INSERT INTO electronic_payrolls (id, prefijo, consecutivo, ano, mes, estado_dian, cufe, employee_id, total_devengos, total_deducciones, total_neto, xml_generado)
    VALUES (?, 'NOM', 1, 2026, 10, 'APROBADO', 'cune_nom_00000001_test_dian_colombia_555555555', ?, 2474203.28, 178008.66, 2296194.62, ?)
  `).run(nomId, employee.id, nomXml);
  nomRec = { id: nomId };
  console.log('Created Nómina record NOM-00000001 with id:', nomId);
} else {
  console.log('Nómina record NOM-00000001 exists with id:', nomRec.id);
}

// 6. Nota de Ajuste a Nómina Electrónica (NAN-00000001)
let nanRec = db.prepare("SELECT id FROM electronic_payrolls WHERE prefijo = 'NAN' AND consecutivo = 1").get();
const nanXml = `<?xml version="1.0" encoding="UTF-8"?>
<NominaIndividualDeAjuste xmlns="dian:gov:co:facturaelectronica:NominaIndividualDeAjuste">
  <InformacionGeneral TipoXML="103" CUNE="cune_nan_00000001_ajuste_dian_colombia_777777777" />
  <Trabajador TipoTrabajador="01" PrimerApellido="CORTEZ" SegundoApellido="RIVAS" PrimerNombre="CARLOS" OtrosNombres="ENRIQUE" NumeroDocumento="2000002362" />
  <Devengados><Basico DiasTrabajados="30" SueldoTrabajado="2550000.00" /></Devengados>
  <Deducciones><Salud Deduccion="92500.00" /><FondoPension Deduccion="92500.00" /></Deducciones>
  <DevengadosTotal>2550000.00</DevengadosTotal>
  <DeduccionesTotal>185000.00</DeduccionesTotal>
  <ComprobanteTotal>2365000.00</ComprobanteTotal>
</NominaIndividualDeAjuste>`;

if (!nanRec) {
  const nanId = 'nan' + Math.random().toString(36).substring(2, 14);
  db.prepare(`
    INSERT INTO electronic_payrolls (id, prefijo, consecutivo, ano, mes, estado_dian, cufe, employee_id, total_devengos, total_deducciones, total_neto, xml_generado)
    VALUES (?, 'NAN', 1, 2026, 10, 'APROBADO', 'cune_nan_00000001_ajuste_dian_colombia_777777777', ?, 2550000.00, 185000.00, 2365000.00, ?)
  `).run(nanId, employee.id, nanXml);
  nanRec = { id: nanId };
  console.log('Created Nota de Ajuste Nómina record NAN-00000001 with id:', nanId);
} else {
  console.log('Nota de Ajuste Nómina record NAN-00000001 exists with id:', nanRec.id);
}

console.log('\n--- ALL TEST RECORDS READY ---');
console.log('DS txId:', dsTx.id);
console.log('NDS txId:', ndsTx.id);
console.log('NOM id:', nomRec.id);
console.log('NAN id:', nanRec.id);
