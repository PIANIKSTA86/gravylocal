const fs = require('fs');
const path = require('path');

const orchestratorCode = fs.readFileSync(path.join(__dirname, '../hub/orchestrator.js'), 'utf8');
const PDFDocument = require(path.join(__dirname, '../hub/node_modules/pdfkit'));

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>FE954</cbc:ID>
  <cbc:IssueDate>2026-07-25</cbc:IssueDate>
  <cbc:IssueTime>10:30:00-05:00</cbc:IssueTime>
  <cbc:DueDate>2026-08-25</cbc:DueDate>
  <cbc:UUID>9876543210abcdef9876543210abcdef98765432</cbc:UUID>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>EMPRESA PRUEBA EMISORA S.A.S</cbc:RegistrationName>
        <cbc:CompanyID>900123456</cbc:CompanyID>
        <cbc:TaxLevelCode>O-13</cbc:TaxLevelCode>
      </cac:PartyTaxScheme>
      <cac:PartyContact>
        <cbc:Telephone>3001234567</cbc:Telephone>
        <cbc:ElectronicMail>contacto@emisor.com</cbc:ElectronicMail>
      </cac:PartyContact>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:CityName>BOGOTA, D.C.</cbc:CityName>
          <cbc:CountrySubentity>CUNDINAMARCA</cbc:CountrySubentity>
          <cac:AddressLine>
            <cbc:Line>CARRERA 7 # 100-20</cbc:Line>
          </cac:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>CLIENTE PRUEBA COMPRADOR LTDA</cbc:RegistrationName>
        <cbc:CompanyID>800987654</cbc:CompanyID>
        <cbc:TaxLevelCode>O-48</cbc:TaxLevelCode>
      </cac:PartyTaxScheme>
      <cac:PartyContact>
        <cbc:Telephone>6015554321</cbc:Telephone>
        <cbc:ElectronicMail>compras@cliente.com</cbc:ElectronicMail>
      </cac:PartyContact>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:CityName>MEDELLIN</cbc:CityName>
          <cbc:CountrySubentity>ANTIOQUIA</cbc:CountrySubentity>
          <cac:AddressLine>
            <cbc:Line>CALLE 50 # 40-10</cbc:Line>
          </cac:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">100000.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="COP">100000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">119000.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="COP">119000.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">1.00</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">100000.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>PRODUCTO DE PRUEBA Y SERVICIO CONTABLE</cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>PROD-001</cbc:ID>
      </cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">100000.00</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

const fnStart = orchestratorCode.indexOf('function generateInvoicePdf(');
const fnEnd = orchestratorCode.indexOf("app.post('/api/dian/download-zip'", fnStart);
const fnCode = orchestratorCode.substring(fnStart, fnEnd);

const testRunner = `
const BASE_DIR = path.join(__dirname, '..');
function fetchQrCode(text) {
  return Promise.resolve(null);
}

${fnCode}

generateInvoicePdf(\`${sampleXml}\`, "FE954", null)
  .then(buffer => {
    fs.writeFileSync(path.join(__dirname, 'test_output_dian.pdf'), buffer);
    console.log("SUCCESS: Generated PDF of", buffer.length, "bytes at test_output_dian.pdf");
  })
  .catch(err => {
    console.error("ERROR generating PDF:", err);
    process.exit(1);
  });
`;

eval(testRunner);
