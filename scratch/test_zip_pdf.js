/**
 * Test del endpoint /api/dian/download-zip actualizado
 * Verifica que devuelve ZIP con XML y PDF
 */
const AdmZip = require('C:/Users/JULIAN/Desktop/GravyLocal2.0/hub/node_modules/adm-zip');

async function run() {
  // XML de prueba con datos de factura
  const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>FE-00000001</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384">abc123def456abc123def456abc123def456abc123def456abc123def456abc123def456abc12</cbc:UUID>
  <cbc:IssueDate>2026-06-13</cbc:IssueDate>
  <cbc:IssueTime>10:30:00-05:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>EMPRESA TEST SAS</cbc:RegistrationName>
        <cbc:CompanyID>900123456</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>601-555-0100</cbc:Telephone>
        <cbc:ElectronicMail>test@empresa.com</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>CLIENTE EJEMPLO LTDA</cbc:RegistrationName>
        <cbc:CompanyID>12345678</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:ElectronicMail>cliente@ejemplo.com</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">19000.00</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">100000.00</cbc:LineExtensionAmount>
    <cbc:PayableAmount currencyID="COP">119000.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="94">2</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">100000.00</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">19000.00</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cac:TaxCategory>
          <cbc:Percent>19.00</cbc:Percent>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>Producto de prueba para factura electrónica</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">50000.00</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  console.log('=== Probando /api/dian/download-zip ===');
  
  const res = await fetch('http://localhost:8088/api/dian/download-zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xmlContent, filename: 'FE-00000001' })
  });
  
  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));
  
  if (!res.ok) {
    console.log('ERROR:', await res.text());
    return;
  }
  
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log('ZIP size:', buffer.length, 'bytes');
  
  // Analizar contenido del ZIP
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  console.log('\nArchivos en el ZIP:');
  entries.forEach(e => {
    console.log(`  ${e.entryName} (${e.header.size} bytes)`);
  });
  
  if (entries.some(e => e.entryName.endsWith('.pdf'))) {
    console.log('\n✅ PDF incluido en el ZIP correctamente');
  } else {
    console.log('\n⚠️  No se encontró PDF en el ZIP');
  }
  
  if (entries.some(e => e.entryName.endsWith('.xml'))) {
    console.log('✅ XML incluido en el ZIP correctamente');
  }
}
run().catch(console.error);
