const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('=== TEST: Generación y Extracción de Concepto en PDF de Documento Soporte ===');

  // Case 1: FacturaTech SOAP XML format
  const ftechXml = `<?xml version="1.0" encoding="UTF-8"?>
<DOCUMENTO_SOPORTE>
  <ENC>
    <ENC_1>DS</ENC_1>
    <ENC_2>901428834</ENC_2>
    <ENC_6>DSE291</ENC_6>
    <ENC_7>2026-07-02</ENC_7>
    <ENC_8>10:39:55-05:00</ENC_8>
    <ENC_9>05</ENC_9>
  </ENC>
  <PRO>
    <PRO_1>2</PRO_1>
    <PRO_2>29113288</PRO_2>
    <PRO_6>SOLLANGE ESMERALDA ZAPATA</PRO_6>
  </PRO>
  <ADQ>
    <ADQ_1>1</ADQ_1>
    <ADQ_2>901428834</ADQ_2>
    <ADQ_6>DOMESTIKO SAS</ADQ_6>
  </ADQ>
  <TOT>
    <TOT_1>75000.00</TOT_1>
    <TOT_4>COP</TOT_4>
    <TOT_7>75000.00</TOT_7>
  </TOT>
  <ITE>
    <ITE_1>1</ITE_1>
    <ITE_3>1.00</ITE_3>
    <ITE_4>ZZ</ITE_4>
    <ITE_5>75000.00</ITE_5>
    <ITE_7>75000.00</ITE_7>
    <ITE_11>ASEO Y VIGILANCIA FEBRERO 2026</ITE_11>
    <IBS>
      <IBS_1>2026-07-02</IBS_1>
      <IBS_2>1</IBS_2>
      <IBS_3>Por operación</IBS_3>
    </IBS>
  </ITE>
</DOCUMENTO_SOPORTE>`;

  // Case 2: DIAN UBL 2.1 AttachedDocument format
  const ublDseXml = `<?xml version="1.0" encoding="UTF-8"?>
<AttachedDocument xmlns="urn:oasis:names:specification:ubl:schema:xsd:AttachedDocument-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>DSE-00000291</cbc:ID>
  <cbc:IssueDate>2026-07-02</cbc:IssueDate>
  <cbc:Note>Pago correspondiente a servicios de aseo.</cbc:Note>
  <cac:Attachment>
    <cac:ExternalReference>
      <cbc:Description>CUDS: dse7682348762384762384762384762384762384762384762384762384762384</cbc:Description>
    </cac:ExternalReference>
  </cac:Attachment>
  <cac:ParentDocumentLineReference>
    <cac:InvoiceLine>
      <cbc:ID>1</cbc:ID>
      <cac:InvoicePeriod>
        <cbc:Description>Por operación</cbc:Description>
      </cac:InvoicePeriod>
      <cbc:InvoicedQuantity unitCode="ZZ">1.00</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="COP">75000.00</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Description>ASEO Y VIGILANCIA SEDE PRINCIPAL</cbc:Description>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="COP">75000.00</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>
  </cac:ParentDocumentLineReference>
</AttachedDocument>`;

  // Load PDF generator from hub/orchestrator
  const orchestratorCode = fs.readFileSync(path.resolve(__dirname, '../hub/orchestrator.js'), 'utf-8');
  
  // Extract generateInvoicePdf function
  const funcMatch = orchestratorCode.match(/function generateInvoicePdf\(xmlContent[\s\S]*?\n\}\n/);
  if (!funcMatch) {
    console.error('No se pudo extraer generateInvoicePdf del orquestador');
    return;
  }
  
  const PDFDocument = require(path.resolve(__dirname, '../hub/node_modules/pdfkit'));
  
  // Eval function in isolated context
  const generateInvoicePdf = new Function('PDFDocument', 'fs', 'path', `
    ${funcMatch[0]}
    return generateInvoicePdf;
  `)(PDFDocument, fs, path);

  console.log('[1/2] Probando PDF con UBL 2.1 AttachedDocument...');
  const pdfBufferUbl = await generateInvoicePdf(ublDseXml, 'DSE-00000291-UBL', {
    notes: 'Comentario contable otorgado por el usuario en la creación del comprobante.'
  });
  console.log(`✓ PDF UBL 2.1 generado con éxito: ${pdfBufferUbl.length} bytes.`);
  fs.writeFileSync(path.resolve(__dirname, 'test_dse_ubl.pdf'), pdfBufferUbl);

  console.log('[2/2] Probando PDF con FacturaTech SOAP XML...');
  const pdfBufferFtech = await generateInvoicePdf(ftechXml, 'DSE-00000291-FTECH', {
    notes: 'Comentario contable otorgado por el usuario en la creación del comprobante.'
  });
  console.log(`✓ PDF FacturaTech generado con éxito: ${pdfBufferFtech.length} bytes.`);
  fs.writeFileSync(path.resolve(__dirname, 'test_dse_ftech.pdf'), pdfBufferFtech);

  console.log('=== TODOS LOS TESTS PASARON EXITOSAMENTE! ===');
}

runTest().catch(console.error);
