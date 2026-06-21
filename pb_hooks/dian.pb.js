/// <reference path="../pb_data/types.d.ts" />

routerAdd('POST', '/api/dian/emit', (e) => {
  const calcularDV = (nit) => {
    const cleanNit = String(nit || '').replace(/[^0-9]/g, '');
    if (!cleanNit) return '0';
    const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    const len = cleanNit.length;
    for (let i = 0; i < len; i++) {
      const digito = parseInt(cleanNit.charAt(len - 1 - i), 10);
      suma += digito * pesos[i];
    }
    const residuo = suma % 11;
    return String(residuo > 1 ? 11 - residuo : residuo);
  };

  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
      return r.get("value") || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const mapDocType = (type) => {
    switch (String(type).toUpperCase()) {
      case 'NIT': return '31';
      case 'CC': return '13';
      case 'CE': return '22';
      case 'TI': return '12';
      case 'PAS': return '41';
      default: return '13'; // CC fallback
    }
  };

  const buildUblXml = function({
  documentType,
  documentNumber,
  issueDate,
  issueTime,
  dianEnvironment,
  emitterNit,
  emitterName,
  emitterAddress,
  emitterPhone,
  emitterEmail,
  custDIANDocType,
  custDocNum,
  custName,
  custAddress,
  custPhone,
  custEmail,
  items,
  subtotal,
  ivaTotal,
  total,
  softwareId,
  mandante
}) {
  const dec = (val) => Number(val || 0).toFixed(2);
  const escXml = (val) => String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
    
  const emitterDv = calcularDV(emitterNit);
  const custDv = custDIANDocType === '31' ? calcularDV(custDocNum) : '0';
    
  const typeCode = documentType === 'Invoice' ? '01' : (documentType === 'CreditNote' ? '91' : '92');
  const customizationValue = mandante ? '11' : '10';
  
  let xml = '';
  
  if (documentType === 'Invoice') {
    xml += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:sts="dian:gov:co:facturaelectronica:Structures-2"
         xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">${customizationValue}</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${escXml(documentNumber)}</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384" schemeID="${dianEnvironment}"><!-- CUFE_PLACEHOLDER --></cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>`;
  } else if (documentType === 'CreditNote') {
    xml += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<CreditNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
            xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
            xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
            xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
            xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
            xmlns:sts="dian:gov:co:facturaelectronica:Structures-2"
            xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Nota Crédito de Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${escXml(documentNumber)}</cbc:ID>
  <cbc:UUID schemeName="CUDE-SHA384" schemeID="${dianEnvironment}"><!-- CUDE_PLACEHOLDER --></cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>`;
  } else { // DebitNote
    xml += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<DebitNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2"
            xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
            xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
            xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
            xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
            xmlns:sts="dian:gov:co:facturaelectronica:Structures-2"
            xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Nota Débito de Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${escXml(documentNumber)}</cbc:ID>
  <cbc:UUID schemeName="CUDE-SHA384" schemeID="${dianEnvironment}"><!-- CUDE_PLACEHOLDER --></cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>`;
  }
  
  xml += `
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escXml(emitterName)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:AddressLine>${escXml(emitterAddress)}</cbc:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${escXml(emitterName)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeID="${emitterDv}" schemeName="31">${escXml(emitterNit)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${escXml(emitterPhone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escXml(emitterEmail)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:AddressLine>${escXml(custAddress)}</cbc:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${escXml(custName)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeID="${custDv}" schemeName="${custDIANDocType}">${escXml(custDocNum)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${escXml(custPhone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escXml(custEmail)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>`;

  xml += `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">${dec(ivaTotal)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="COP">${dec(subtotal)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="COP">${dec(ivaTotal)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>`;

  xml += `
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">${dec(subtotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="COP">${dec(subtotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">${dec(total)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="COP">${dec(total)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>`;

  for (const item of items) {
    if (documentType === 'Invoice') {
      xml += `
  <cac:InvoiceLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="94">${dec(item.qty)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${dec(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${dec(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${dec(item.ivaRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escXml(item.description)}</cbc:Description>
      ${mandante ? `
      <cac:InformationContentProviderParty>
        <cac:PowerOfAttorney>
          <cac:AgentParty>
            <cac:PartyIdentification>
              <cbc:ID schemeAgencyID="195" schemeID="${mandante.dv}" schemeName="${mandante.docType}">${escXml(mandante.docNum)}</cbc:ID>
            </cac:PartyIdentification>
          </cac:AgentParty>
        </cac:PowerOfAttorney>
      </cac:InformationContentProviderParty>
      ` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${dec(item.price)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
    } else if (documentType === 'CreditNote') {
      xml += `
  <cac:CreditNoteLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:CreditedQuantity unitCode="94">${dec(item.qty)}</cbc:CreditedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${dec(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${dec(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${dec(item.ivaRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escXml(item.description)}</cbc:Description>
      ${mandante ? `
      <cac:InformationContentProviderParty>
        <cac:PowerOfAttorney>
          <cac:AgentParty>
            <cac:PartyIdentification>
              <cbc:ID schemeAgencyID="195" schemeID="${mandante.dv}" schemeName="${mandante.docType}">${escXml(mandante.docNum)}</cbc:ID>
            </cac:PartyIdentification>
          </cac:AgentParty>
        </cac:PowerOfAttorney>
      </cac:InformationContentProviderParty>
      ` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${dec(item.price)}</cbc:PriceAmount>
    </cac:Price>
  </cac:CreditNoteLine>`;
    } else { // DebitNote
      xml += `
  <cac:DebitNoteLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:DebitedQuantity unitCode="94">${dec(item.qty)}</cbc:DebitedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${dec(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${dec(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${dec(item.ivaRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escXml(item.description)}</cbc:Description>
      ${mandante ? `
      <cac:InformationContentProviderParty>
        <cac:PowerOfAttorney>
          <cac:AgentParty>
            <cac:PartyIdentification>
              <cbc:ID schemeAgencyID="195" schemeID="${mandante.dv}" schemeName="${mandante.docType}">${escXml(mandante.docNum)}</cbc:ID>
            </cac:PartyIdentification>
          </cac:AgentParty>
        </cac:PowerOfAttorney>
      </cac:InformationContentProviderParty>
      ` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${dec(item.price)}</cbc:PriceAmount>
    </cac:Price>
  </cac:DebitNoteLine>`;
    }
  }

  if (documentType === 'Invoice') {
    xml += '\n</Invoice>';
  } else if (documentType === 'CreditNote') {
    xml += '\n</CreditNote>';
  } else {
    xml += '\n</DebitNote>';
  }
  
  return xml;
}

  const buildFtechXml = function({
    documentType,
    documentNumber,
    issueDate,
    issueTime,
    ftechEnvironment,
    emitterNit,
    emitterName,
    emitterAddress,
    emitterPhone,
    emitterEmail,
    custDIANDocType,
    custDocNum,
    custName,
    custAddress,
    custPhone,
    custEmail,
    items,
    subtotal,
    ivaTotal,
    total,
    prefix,
    folio,
    resolution,
    companyThird,
    customer,
    crossDocRef,
    clTec,
    cajaName,
    mandante
  }) {
    const dec = (val) => Number(val || 0).toFixed(2);
    const escXml = (val) => String(val || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const isNC = (documentType === 'CreditNote');
    const isND = (documentType === 'DebitNote');
    const isInv = (documentType === 'Invoice');

    // 1. Root Element
    const rootTag = (isNC || isND) ? 'NOTA' : 'FACTURA';

    // 2. ENC Block
    const enc1 = isNC ? 'NC' : (isND ? 'ND' : 'INVOIC');
    const enc2 = escXml(emitterNit);
    const enc3 = escXml(custDocNum);
    const enc4 = 'UBL 2.1';
    const enc5 = 'DIAN 2.1';
    const enc6 = escXml(prefix + (isNaN(Number(folio)) ? folio : String(Number(folio))));
    const enc9 = isNC ? '91' : (isND ? '92' : '01');
    const enc10 = 'COP';
    const enc15 = String(items.length);
    const enc16 = issueDate;
    const enc20 = escXml(ftechEnvironment || '2'); // 1 = Prod, 2 = Test
    const enc21 = isNC ? '20' : (isND ? '30' : (mandante ? '11' : '10'));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag}>
  <ENC>
    <ENC_1>${enc1}</ENC_1>
    <ENC_2>${enc2}</ENC_2>
    <ENC_3>${enc3}</ENC_3>
    <ENC_4>${enc4}</ENC_4>
    <ENC_5>${enc5}</ENC_5>
    <ENC_6>${enc6}</ENC_6>
    <ENC_9>${enc9}</ENC_9>
    <ENC_10>${enc10}</ENC_10>
    <ENC_15>${enc15}</ENC_15>
    <ENC_16>${enc16}</ENC_16>
    <ENC_20>${enc20}</ENC_20>
    <ENC_21>${enc21}</ENC_21>
  </ENC>`;

    // 3. IPV Block (Establishment & Resolution)
    const ipv1 = escXml(clTec || "00331-10000-00001-AA962");
    const ipv2 = escXml(cajaName || "Caja1");
    const ipv3 = escXml(companyThird ? companyThird.getString("contact_name") : emitterName);
    const ipv4 = escXml(cajaName || "CAJA1").toUpperCase();
    const ipv5 = escXml(prefix || 'FE');
    const ipv6 = dec(total);

    xml += `
  <IPV>
    <IPV_1>${ipv1}</IPV_1>
    <IPV_2>${ipv2}</IPV_2>
    <IPV_3>${ipv3}</IPV_3>
    <IPV_4>${ipv4}</IPV_4>
    <IPV_5>${ipv5}</IPV_5>
    <IPV_6>${ipv6}</IPV_6>
  </IPV>`;

    // 4. EMI Block (Emitter)
    const emi1 = companyThird && companyThird.getString("person_type") === 'JURIDICA' ? '2' : '1';
    const emi2 = escXml(emitterNit);
    const emi3 = '31'; // Emitter ID type must always be NIT (31) for electronic billing
    const emi6 = escXml(emitterName);
    const emi7 = escXml(companyThird ? (companyThird.getString("commercial_name") || companyThird.getString("name")) : emitterName);
    const emi10 = escXml(emitterAddress);
    
    const emiDeptCode = companyThird ? (companyThird.getString("dept_code") || '11') : '11';
    const emiDeptName = companyThird ? (companyThird.getString("department") || 'BOGOTA') : 'BOGOTA';
    const emiCityCode = companyThird ? (companyThird.getString("city_code") || '11001') : '11001';
    const emiCityName = companyThird ? (companyThird.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.';
    const emiCountryCode = companyThird ? (companyThird.getString("country") || 'CO') : 'CO';
    const emiDv = calcularDV(emitterNit);
    const emiPostal = '110111';
    const emiPostalDfe = '111011';
    const emiContact = escXml(companyThird ? (companyThird.getString("contact_name") || companyThird.getString("name")) : emitterName);
    
    const emiTac1 = emi1 === '1' ? 'R-99-PN' : 'R-99-PJ';
    const emiIcc1 = '000000';
    const emiIcc9 = escXml(prefix || 'FE');

    xml += `
  <EMI>
    <EMI_1>${emi1}</EMI_1>
    <EMI_2>${emi2}</EMI_2>
    <EMI_3>${emi3}</EMI_3>
    <EMI_6>${emi6}</EMI_6>
    <EMI_7>${emi7}</EMI_7>
    <EMI_10>${emi10}</EMI_10>
    <EMI_11>${emiDeptCode}</EMI_11>
    <EMI_13>${emiDeptName}</EMI_13>
    <EMI_14>${emiPostal}</EMI_14>
    <EMI_15>${emiCountryCode}</EMI_15>
    <EMI_19>${emiCityName}</EMI_19>
    <EMI_22>${emiDv}</EMI_22>
    <EMI_23>${emiCityCode}</EMI_23>
    <EMI_24>${emiContact}</EMI_24>
    <TAC>
      <TAC_1>${emiTac1}</TAC_1>
    </TAC>
    <DFE>
      <DFE_1>${emiCityCode}</DFE_1>
      <DFE_2>${emiDeptCode}</DFE_2>
      <DFE_3>${emiCountryCode}</DFE_3>
      <DFE_4>${emiPostalDfe}</DFE_4>
      <DFE_5>COLOMBIA</DFE_5>
      <DFE_6>${emiCityName}</DFE_6>
      <DFE_7>${emiDeptName}</DFE_7>
      <DFE_8>${emi10}</DFE_8>
    </DFE>
    <ICC>
      <ICC_1>${emiIcc1}</ICC_1>
      <ICC_9>${emiIcc9}</ICC_9>
    </ICC>
    <CDE>
      <CDE_2>${emiContact}</CDE_2>
      <CDE_3>${escXml(emitterPhone)}</CDE_3>
      <CDE_4>${escXml(emitterEmail)}</CDE_4>
    </CDE>
    <GTE>
      <GTE_1>01</GTE_1>
      <GTE_2>IVA</GTE_2>
    </GTE>
  </EMI>`;

    // 5. ADQ Block (Acquirer)
    const adq1 = customer && customer.getString("person_type") === 'JURIDICA' ? '2' : '1';
    const adq2 = escXml(custDocNum);
    const adq3 = (custDocNum === '222222222222' || custName.toUpperCase() === 'CONSUMIDOR FINAL') ? '13' : escXml(custDIANDocType);
    const adq6 = escXml(custName);
    
    const adqDeptCode = customer ? (customer.getString("dept_code") || '11') : '11';
    const adqDeptName = customer ? (customer.getString("department") || 'BOGOTA') : 'BOGOTA';
    const adqCityCode = customer ? (customer.getString("city_code") || '11001') : '11001';
    const adqCityName = customer ? (customer.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.';
    const adqCountryCode = customer ? (customer.getString("country") || 'CO') : 'CO';
    const adqAddress = escXml(custAddress);
    const adqTac1 = adq1 === '1' ? 'R-99-PN' : 'R-99-PJ';
    const adqDv = adq3 === '31' ? calcularDV(custDocNum) : (customer ? (customer.getString("dv") || '0') : '0');

    xml += `
  <ADQ>
    <ADQ_1>${adq1}</ADQ_1>
    <ADQ_2>${adq2}</ADQ_2>
    <ADQ_3>${adq3}</ADQ_3>
    <ADQ_6>${adq6}</ADQ_6>
    <ADQ_11>${adqDeptCode}</ADQ_11>
    <ADQ_13>${adqCityName}</ADQ_13>
    <ADQ_15>${adqCountryCode}</ADQ_15>
    <ADQ_22>${adqDv}</ADQ_22>
    <TCR>
      <TCR_1>${adqTac1}</TCR_1>
    </TCR>
    <CDA>
      <CDA_2>${adq6}</CDA_2>
      <CDA_3>${escXml(custPhone)}</CDA_3>
      <CDA_4>${escXml(custEmail)}</CDA_4>
    </CDA>
    <GTA>
      <GTA_1>01</GTA_1>
      <GTA_2>IVA</GTA_2>
    </GTA>
  </ADQ>`;

    // 6. TOT Block
    xml += `
  <TOT>
    <TOT_1>${dec(subtotal)}</TOT_1>
    <TOT_2>COP</TOT_2>
    <TOT_3>${dec(subtotal)}</TOT_3>
    <TOT_4>COP</TOT_4>
    <TOT_5>${dec(total)}</TOT_5>
    <TOT_6>COP</TOT_6>
    <TOT_7>${dec(total)}</TOT_7>
    <TOT_8>COP</TOT_8>
  </TOT>`;

    // 7. TIM Block
    const taxGroups = {};
    for (const item of items) {
      const rate = Number(item.ivaRate || 0).toFixed(1);
      if (!taxGroups[rate]) {
        taxGroups[rate] = { base: 0, amount: 0 };
      }
      taxGroups[rate].base += Number(item.subtotal || 0);
      taxGroups[rate].amount += Number(item.ivaAmount || 0);
    }
    
    if (Object.keys(taxGroups).length === 0) {
      taxGroups["0.0"] = { base: subtotal, amount: 0 };
    }

    xml += `
  <TIM>
    <TIM_1>false</TIM_1>
    <TIM_2>${dec(ivaTotal)}</TIM_2>
    <TIM_3>COP</TIM_3>`;

    for (const rate of Object.keys(taxGroups)) {
      const group = taxGroups[rate];
      xml += `
    <IMP>
      <IMP_1>01</IMP_1>
      <IMP_2>${dec(group.base)}</IMP_2>
      <IMP_3>COP</IMP_3>
      <IMP_4>${dec(group.amount)}</IMP_4>
      <IMP_5>COP</IMP_5>
      <IMP_6>${rate}</IMP_6>
    </IMP>`;
    }
    xml += `
  </TIM>`;

    // 8. DRF Block
    const drf1 = escXml(resolution ? resolution.getString("resolution_number") : "18764000000001");
    const drf2 = resolution ? resolution.getString("resolution_date").slice(0, 10) : "2026-01-01";
    const drf3 = resolution ? resolution.getString("expiration_date").slice(0, 10) : "2030-01-01";
    const drf4 = escXml(prefix || 'FE');
    const drf5 = String(resolution ? resolution.getInt("number_from") : 1);
    const drf6 = String(resolution ? resolution.getInt("number_to") : 10000);

    xml += `
  <DRF>
    <DRF_1>${drf1}</DRF_1>
    <DRF_2>${drf2}</DRF_2>
    <DRF_3>${drf3}</DRF_3>
    <DRF_4>${drf4}</DRF_4>
    <DRF_5>${drf5}</DRF_5>
    <DRF_6>${drf6}</DRF_6>
  </DRF>`;

    // 9. REF Block
    if ((isNC || isND) && crossDocRef) {
      let refPrefix = "FE";
      let refFolio = crossDocRef.replace(/[^0-9]/g, '');
      let refDate = "";
      let refCufe = "";
      
      try {
        const origInvoice = $app.findFirstRecordByFilter("invoices", "number = '" + crossDocRef + "'");
        if (origInvoice) {
          refDate = origInvoice.getString("date").slice(0, 10);
          try {
            const origDoc = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + origInvoice.getString("tx_id") + "'");
            if (origDoc) {
              refCufe = origDoc.getString("cufe");
            }
          } catch (_) {}
        }
      } catch (_) {}

      const parts = crossDocRef.split("-");
      if (parts.length > 1) {
        refPrefix = parts[0];
        refFolio = parts.slice(1).join("-").replace(/[^0-9]/g, '');
      } else {
        const match = crossDocRef.match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
          refPrefix = match[1];
          refFolio = match[2];
        }
      }
      
      if (!refDate) {
        refDate = new Date().toISOString().slice(0, 10);
      }
      if (!refCufe) {
        refCufe = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
      }

      xml += `
  <REF>
    <REF_1>IV</REF_1>
    <REF_2>${escXml(refPrefix + refFolio)}</REF_2>
    <REF_3>${refDate}</REF_3>
    <REF_4>${escXml(refCufe)}</REF_4>
    <REF_5>CUFE-SHA384</REF_5>
  </REF>`;
    }

    // 10. MEP Block
    let mep1 = "10";
    let mep2 = "1";
    xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>${mep2}</MEP_2>
  </MEP>`;

    // 11. CDN Block
    if (isNC || isND) {
      const cdn1 = isNC ? '2' : '1';
      const cdn2 = isNC ? 'Anulacion de factura electronica de venta' : 'Ajuste de factura electronica de venta';
      xml += `
  <CDN>
    <CDN_1>${cdn1}</CDN_1>
    <CDN_2>${cdn2}</CDN_2>
  </CDN>`;
    }

    // 12. ITE Blocks
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemIdx = String(idx + 1);
      const itemQty = dec(item.qty);
      const itemPrice = dec(item.price);
      const itemSubtotal = dec(item.subtotal);
      const itemDesc = escXml(item.description);
      const itemIvaRate = dec(item.ivaRate || 0);
      const itemIvaAmount = dec(item.ivaAmount || 0);

      xml += `
  <ITE>
    <ITE_1>${itemIdx}</ITE_1>
    <ITE_3>${itemQty}</ITE_3>
    <ITE_4>ZZ</ITE_4>
    <ITE_5>${itemPrice}</ITE_5>
    <ITE_6>COP</ITE_6>
    <ITE_7>${itemSubtotal}</ITE_7>
    <ITE_8>COP</ITE_8>
    <ITE_11>${itemDesc}</ITE_11>
    <ITE_19>${itemSubtotal}</ITE_19>
    <ITE_20>COP</ITE_20>
    <ITE_27>${itemQty}</ITE_27>
    <ITE_28>ZZ</ITE_28>
    <IAE>
      <IAE_1>99999999</IAE_1>
      <IAE_2>999</IAE_2>
    </IAE>
    <TII>
      <TII_1>${itemIvaAmount}</TII_1>
      <TII_2>COP</TII_2>
      <TII_3>false</TII_3>
      <IIM>
        <IIM_1>01</IIM_1>
        <IIM_2>${itemIvaAmount}</IIM_2>
        <IIM_3>COP</IIM_3>
        <IIM_4>${itemSubtotal}</IIM_4>
        <IIM_5>COP</IIM_5>
        <IIM_6>${itemIvaRate}</IIM_6>
      </IIM>
    </TII>
  </ITE>`;
    }

    xml += `
</${rootTag}>`;

    return xml;
  };


  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }
  
  const body = e.requestInfo()?.body || {};
  const txId = body.txId || body.tx_id;
  if (!txId) {
    e.json(400, { message: "txId es requerido." });
    return;
  }
  
  try {
    const tx = $app.findRecordById("transactions", txId);
    if (!tx) {
      e.json(404, { message: "Transacción no encontrada." });
      return;
    }
    
    $app.expandRecord(tx, ["tx_type_id", "third_party_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const customer = tx.expandedOne("third_party_id");
    
    const txTypeCode = txType ? txType.getString("code") : "";
    const isPOS = (txTypeCode === "POS");
    const isNC = (txTypeCode === "NC");
    const isND = (txTypeCode === "ND");
    const isFV = (txTypeCode === "FV");
    const isIA = (txTypeCode === "IA");
    
    if (!isPOS && !isNC && !isND && !isFV && !isIA) {
      e.json(400, { message: "El tipo de transacción '" + txTypeCode + "' no es válido para facturación DIAN." });
      return;
    }
    
    // Check or create einvoice_docs
    let docRecord;
    try {
      docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
      if (docRecord.getString("status") === "aceptada") {
        e.json(400, { message: "Este documento ya fue aceptado por la DIAN." });
        return;
      }
    } catch (_) {
      const einvoiceDocsCol = $app.findCollectionByNameOrId("einvoice_docs");
      docRecord = new Record(einvoiceDocsCol, {
        tx_id: txId,
        status: "pendiente",
        cufe: "",
        dian_response: "",
        xml_content: ""
      });
      $app.save(docRecord);
    }
    
    
    const einvoiceMethod = getSetting("einvoice_method", "dian");
    const ftechUsername = getSetting("ftech_username", "");
    const ftechPassword = getSetting("ftech_password", "");
    const ftechEnvironment = getSetting("ftech_environment", "2");
    const companyThirdPartyId = getSetting("company_third_party_id", "");

    let emitterNit = getSetting("dian_nit", getSetting("company_nit", "900123456"));
    let emitterName = getSetting("company_name", "GRAVY CORP SAS");
    let emitterAddress = getSetting("company_address", "Calle 1 # 2 - 3");
    let emitterPhone = getSetting("company_phone", "601-555-0100");
    let emitterEmail = getSetting("company_email", "dian@gravy.com");

    if (companyThirdPartyId) {
      try {
        const companyThird = $app.findRecordById("third_parties", companyThirdPartyId);
        if (companyThird) {
          emitterNit = companyThird.getString("doc_number") || emitterNit;
          emitterName = companyThird.getString("name") || emitterName;
          emitterAddress = companyThird.getString("address") || emitterAddress;
          emitterPhone = companyThird.getString("phone") || emitterPhone;
          emitterEmail = companyThird.getString("email") || emitterEmail;
        }
      } catch (err) {
        console.warn("[GRAVY] Error al cargar tercero de empresa:", err);
      }
    }

    const dianEnvironment = getSetting("dian_environment", "2");
    const clTec = getSetting("dian_cltec", "");
    const softwarePin = getSetting("dian_software_pin", "");
    const softwareId = getSetting("dian_software_id", "");
    const certBase64 = getSetting("dian_certificate_base64", "");
    const certPassword = getSetting("dian_certificate_password", "");
    
    const custName = customer ? customer.getString("name") : "Consumidor Final";
    const custDocType = customer ? customer.getString("doc_type") : "CC";
    const custDocNum = customer ? customer.getString("doc_number") : "222222222222";
    const custEmail = customer ? customer.getString("email") : "cliente@dian.com";
    const custPhone = customer ? customer.getString("phone") : "555-5555";
    const custAddress = customer ? customer.getString("address") : "Ciudad";
    
    const custDIANDocType = mapDocType(custDocType);
    
    // Format issueDate: must be YYYY-MM-DD
    const issueDate = tx.getString("date").slice(0, 10) || new Date().toISOString().slice(0, 10);
    // Format issueTime: must be HH:MM:SS-05:00
    const issueTime = new Date().toTimeString().slice(0, 8) + "-05:00";
    
    let subtotal = 0;
    let ivaTotal = 0;
    let total = 0;
    let items = [];
    
    let invoice = null;
    let isInmoInvoice = false;
    try {
      invoice = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
    } catch (_) {
      try {
        invoice = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        try {
          invoice = $app.findFirstRecordByFilter("inmo_invoices", "tx_id = '" + txId + "'");
          isInmoInvoice = true;
        } catch (_) {}
      }
    }
    
    let mandanteInfo = null;
    if (invoice) {
      if (isInmoInvoice) {
        subtotal = invoice.getFloat("rent_amount") + (invoice.getFloat("other_amount") || 0);
        ivaTotal = 0;
        total = invoice.getFloat("total");
        
        try {
          const contract = $app.findRecordById("inmo_contracts", invoice.getString("contract_id"));
          const property = $app.findRecordById("inmo_properties", contract.getString("property_id"));
          const owner = $app.findRecordById("third_parties", property.getString("owner_id"));
          if (owner) {
            mandanteInfo = {
              docNum: owner.getString("doc_number"),
              docType: mapDocType(owner.getString("doc_type")),
              dv: owner.getString("dv") || calcularDV(owner.getString("doc_number")),
              name: owner.getString("name")
            };
          }
        } catch (err) {
          console.warn("[GRAVY] Error al cargar mandante para factura electrónica:", err);
        }

        const lines = $app.findRecordsByFilter("inmo_invoice_lines", "invoice_id = '" + invoice.id + "'", "line_order");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          items.push({
            id: String(i + 1),
            description: line.getString("description") || "Canon de arrendamiento",
            qty: 1,
            price: line.getFloat("amount") || 0,
            ivaRate: 0,
            ivaAmount: 0,
            subtotal: line.getFloat("amount") || 0,
            total: line.getFloat("amount") || 0
          });
        }
      } else {
        subtotal = invoice.getFloat("subtotal");
        ivaTotal = invoice.getFloat("iva_total");
        total = invoice.getFloat("total");
        
        const lines = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invoice.id + "'", "line_order");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          let desc = line.getString("description");
          if (!desc) {
            const prodId = line.getString("product_id");
            if (prodId) {
              try {
                const product = $app.findRecordById("products", prodId);
                if (product) {
                  desc = product.getString("name") || product.getString("description");
                }
              } catch (_) {}
            }
          }
          if (!desc) {
            desc = "Producto/Servicio";
          }

          items.push({
            id: String(i + 1),
            description: desc,
            qty: line.getFloat("qty") || 1,
            price: line.getFloat("unit_price") || 0,
            ivaRate: line.getFloat("iva_rate") || 0,
            ivaAmount: line.getFloat("iva_amount") || 0,
            subtotal: line.getFloat("subtotal") || 0,
            total: line.getFloat("total") || 0
          });
        }
      }
    } else {
      const lines = $app.findRecordsByFilter("tx_lines", "tx_id = '" + txId + "'", "line_order");
      let lineIdx = 1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const d = line.getFloat("debit");
        const c = line.getFloat("credit");
        const amount = d > 0 ? d : c;
        if (amount > 0) {
          items.push({
            id: String(lineIdx++),
            description: line.getString("description") || "Concepto Contable",
            qty: 1,
            price: amount,
            ivaRate: 0,
            ivaAmount: 0,
            subtotal: amount,
            total: amount
          });
          subtotal += amount;
        }
      }
      total = subtotal;
    }
    
    const docNumber = tx.getString("number") || ("TEMP" + Date.now());
    const prefix = txType ? txType.getString("prefix") : "";
    let folio = docNumber;
    if (prefix && folio.startsWith(prefix)) {
      folio = folio.substring(prefix.length);
    }
    folio = folio.replace(/[^0-9]/g, '');

    let companyThird = null;
    if (companyThirdPartyId) {
      try {
        companyThird = $app.findRecordById("third_parties", companyThirdPartyId);
      } catch (err) {
        console.warn("[GRAVY] Error al cargar tercero de empresa:", err);
      }
    }

    let docTypeForRes = "FV";
    if (isNC) docTypeForRes = "NC";
    else if (isND) docTypeForRes = "ND";
    else if (isPOS) docTypeForRes = "POS";
    else if (isIA) docTypeForRes = "FV";

    let resolution = null;
    try {
      resolution = $app.findFirstRecordByFilter("dian_resolutions", "active = true && prefix = '" + prefix + "' && document_type = '" + docTypeForRes + "'");
    } catch (_) {
      try {
        resolution = $app.findFirstRecordByFilter("dian_resolutions", "active = true && document_type = '" + docTypeForRes + "'");
      } catch (_) {}
    }

    let cajaName = "Caja1";
    const posShiftId = tx.getString("pos_shift_id");
    if (posShiftId) {
      try {
        const shift = $app.findRecordById("pos_shifts", posShiftId);
        const regId = shift.getString("pos_register_id");
        if (regId) {
          const register = $app.findRecordById("pos_registers", regId);
          if (register) {
            cajaName = (register.getString("name") || "Caja1").replace(/\s+/g, "");
          }
        }
      } catch (_) {}
    } else if (resolution) {
      const regId = resolution.getString("pos_register_id");
      if (regId) {
        try {
          const register = $app.findRecordById("pos_registers", regId);
          if (register) {
            cajaName = (register.getString("name") || "Caja1").replace(/\s+/g, "");
          }
        } catch (_) {}
      }
    }

    let xml = "";
    if (einvoiceMethod === "facturatech") {
      xml = buildFtechXml({
        documentType: (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')),
        documentNumber: docNumber,
        issueDate,
        issueTime,
        ftechEnvironment,
        emitterNit,
        emitterName,
        emitterAddress,
        emitterPhone,
        emitterEmail,
        custDIANDocType,
        custDocNum,
        custName,
        custAddress,
        custPhone,
        custEmail,
        items,
        subtotal,
        ivaTotal,
        total,
        prefix,
        folio,
        resolution,
        companyThird,
        customer,
        clTec,
        cajaName,
        mandante: mandanteInfo,
        crossDocRef: (() => {
          if (!invoice) return "";
          const notesStr = invoice.getString("notes") || "";
          const m = notesStr.match(/Ajuste a documento\s+([A-Za-z0-9\-]+)/i);
          return m ? m[1].trim() : "";
        })()
      });
    } else {
      xml = buildUblXml({
        documentType: (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')),
        documentNumber: docNumber,
        issueDate,
        issueTime,
        dianEnvironment,
        emitterNit,
        emitterName,
        emitterAddress,
        emitterPhone,
        emitterEmail,
        custDIANDocType,
        custDocNum,
        custName,
        custAddress,
        custPhone,
        custEmail,
        items,
        subtotal,
        ivaTotal,
        total,
        softwareId,
        mandante: mandanteInfo
      });
    }

    if (body.dryRun || body.testXml) {
      e.json(200, { success: true, xml: xml });
      return;
    }

    if (einvoiceMethod === "facturatech") {
      if (docRecord.getString("status") === "enviada" && docRecord.getString("ftech_transaction_id")) {
        e.json(400, { message: "El documento ya fue enviado a Facturatech. Use la opción de Consultar Estado para actualizar." });
        return;
      }
      
      const hubUrl = "http://127.0.0.1:8088/api/facturatech/upload-and-send";
      console.log("[GRAVY HOOK] Enviando a Facturatech en Hub: " + hubUrl);
      
      const requestBody = {
        xmlContent: xml,
        ftechUsername,
        ftechPassword,
        ftechEnvironment,
        documentType: (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')),
        documentNumber: docNumber,
        prefix,
        folio,
        isPOS: isPOS
      };
      
      const res = $http.send({
        url: hubUrl,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      if (res.statusCode !== 200) {
        throw new Error("El Hub Facturatech retornó código: " + res.statusCode + " - " + res.raw);
      }
      
      const responseData = JSON.parse(res.raw);
      
      if (!responseData.success) {
        throw new Error(responseData.error || responseData.message || "Error al subir a Facturatech.");
      }
      
      docRecord.set("ftech_transaction_id", responseData.transaccionID || "");
      docRecord.set("status", responseData.status || "enviada");
      docRecord.set("cufe", responseData.cufe || "");
      docRecord.set("dian_response", responseData.message || "Enviado a Facturatech.");
      docRecord.set("xml_content", responseData.xmlContent || xml);
      docRecord.set("sent_at", new Date().toISOString());
      $app.save(docRecord);
      
      e.json(200, {
        success: true,
        status: docRecord.get("status"),
        cufe: docRecord.get("cufe"),
        dianResponse: docRecord.get("dian_response"),
        simulated: !!responseData.simulated
      });
      return;
    }
    
    // Call Hub (Direct DIAN)
    const hubUrl = "http://127.0.0.1:8088/api/dian/sign-and-send";
    console.log("[GRAVY HOOK] Enviando a firmar en Hub: " + hubUrl);
    
    const requestBody = {
      xmlContent: xml,
      certBase64,
      certPassword,
      dianEnvironment,
      documentType: (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')),
      documentNumber: docNumber,
      dianNit: emitterNit,
      issueDate,
      issueTime,
      valFac: subtotal,
      ivaTotal,
      incTotal: 0,
      icaTotal: 0,
      valTot: total,
      adquirerNit: custDocNum,
      clTec,
      softwarePin
    };
    
    const res = $http.send({
      url: hubUrl,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    
    if (res.statusCode !== 200) {
      throw new Error("El Hub retornó código de error: " + res.statusCode + " - " + res.raw);
    }
    
    const responseData = JSON.parse(res.raw);
    
    // Update status in db
    docRecord.set("status", responseData.isValid ? "aceptada" : "rechazada");
    docRecord.set("cufe", responseData.xmlDocumentKey || "");
    docRecord.set("dian_response", responseData.statusMessage || responseData.error || "Procesado.");
    docRecord.set("xml_content", responseData.xmlContent || xml);
    docRecord.set("sent_at", new Date().toISOString());
    $app.save(docRecord);
    
    e.json(200, {
      success: true,
      status: docRecord.get("status"),
      cufe: docRecord.get("cufe"),
      dianResponse: docRecord.get("dian_response"),
      simulated: !!responseData.simulated
    });
    
  } catch (err) {
    console.error("[GRAVY HOOK] Error al emitir a la DIAN:", err);
    e.json(500, { message: "Error al procesar la emisión DIAN: " + err.message });
  }
});

routerAdd('POST', '/api/dian/check-status', (e) => {
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
      return r.get("value") || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }
  
  const body = e.requestInfo()?.body || {};
  const txId = body.txId || body.tx_id;
  if (!txId) {
    e.json(400, { message: "txId es requerido." });
    return;
  }
  
  try {
    const docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
    if (!docRecord) {
      e.json(404, { message: "Documento de facturación no encontrado para esta transacción." });
      return;
    }
    
    if (docRecord.getString("status") === "aceptada") {
      e.json(200, {
        success: true,
        status: "aceptada",
        cufe: docRecord.getString("cufe"),
        dianResponse: "Este documento ya fue aceptado por la DIAN."
      });
      return;
    }
    
    const transId = docRecord.getString("ftech_transaction_id");
    if (!transId) {
      e.json(400, { message: "El documento no tiene un ID de transacción de Facturatech asociado." });
      return;
    }
    
    const tx = $app.findRecordById("transactions", txId);
    $app.expandRecord(tx, ["tx_type_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const prefix = txType ? txType.getString("prefix") : "";
    const docNumber = tx.getString("number") || "";
    let folio = docNumber;
    if (prefix && folio.startsWith(prefix)) {
      folio = folio.substring(prefix.length);
    }
    folio = folio.replace(/[^0-9]/g, '');
    
    const ftechUsername = getSetting("ftech_username", "");
    const ftechPassword = getSetting("ftech_password", "");
    const ftechEnvironment = getSetting("ftech_environment", "2");
    
    const hubUrl = "http://127.0.0.1:8088/api/facturatech/check-status";
    console.log("[GRAVY HOOK] Consultando estado en Hub: " + hubUrl);
    
    const isPOS = txType ? (txType.getString("code") === "POS") : false;
    const requestBody = {
      transId,
      ftechUsername,
      ftechPassword,
      ftechEnvironment,
      prefix,
      folio,
      isPOS: isPOS,
      documentNumber: docNumber
    };
    
    const res = $http.send({
      url: hubUrl,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    
    if (res.statusCode !== 200) {
      throw new Error("El Hub retornó código: " + res.statusCode + " - " + res.raw);
    }
    
    const responseData = JSON.parse(res.raw);
    
    if (!responseData.success) {
      throw new Error(responseData.error || responseData.message || "Error al consultar estado en Facturatech.");
    }
    
    docRecord.set("status", responseData.status || "enviada");
    if (responseData.cufe) {
      docRecord.set("cufe", responseData.cufe);
    }
    if (responseData.xmlContent) {
      docRecord.set("xml_content", responseData.xmlContent);
    }
    docRecord.set("dian_response", responseData.message || "Procesado.");
    $app.save(docRecord);
    
    e.json(200, {
      success: true,
      status: docRecord.get("status"),
      cufe: docRecord.get("cufe"),
      dianResponse: docRecord.get("dian_response"),
      simulated: !!responseData.simulated
    });
    
  } catch (err) {
    console.error("[GRAVY HOOK] Error al consultar estado Facturatech:", err);
    e.json(500, { message: "Error al consultar estado Facturatech: " + err.message });
  }
});

routerAdd('POST', '/api/dian/resend-email', (e) => {
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
      return r.get("value") || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const syncSmtpSettings = function() {
    const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = getSetting("smtp_host", "");
        const port = parseInt(getSetting("smtp_port", "587"), 10);
        const user = getSetting("smtp_username", "");
        const pass = getSetting("smtp_password", "");
        const senderName = getSetting("smtp_sender_name", "");
        const senderAddr = getSetting("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || getSetting("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
      console.log("[GRAVY DIAN SMTP SYNC] SMTP settings applied successfully. Host:", pbSettings.smtp.host, "Enabled:", pbSettings.smtp.enabled);
    } catch (err) {
      console.error("[GRAVY DIAN SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
    }
  };

  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }
  
  const body = e.requestInfo()?.body || {};
  const txId = body.txId || body.tx_id;
  if (!txId) {
    e.json(400, { message: "txId es requerido." });
    return;
  }
  
  try {
    const docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
    if (!docRecord) {
      e.json(404, { message: "Documento de facturación no encontrado para esta transacción." });
      return;
    }
    
    const xmlContent = docRecord.getString("xml_content");
    if (!xmlContent) {
      e.json(400, { message: "El documento no posee contenido XML firmado para reenviar." });
      return;
    }
    
    const tx = $app.findRecordById("transactions", txId);
    $app.expandRecord(tx, ["third_party_id"], null);
    const customer = tx.expandedOne("third_party_id");
    let custEmail = body.email || body.custEmail;
    if (!custEmail) {
      custEmail = customer ? customer.getString("email") : "";
    }
    if (!custEmail) {
      e.json(400, { message: "Debe configurar un correo en la ficha del tercero o ingresar un correo alternativo." });
      return;
    }
    
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyEmail = getSetting("company_email", "noreply@gravy.com");
    const docNumber = tx.getString("number") || "Factura";

    let totalVal = 0;
    try {
      const invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      totalVal = invRec.getFloat("total") || 0;
    } catch (_) {
      try {
        const purRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
        totalVal = purRec.getFloat("total") || 0;
      } catch (_2) {}
    }
    const fmtTotal = "$ " + Math.round(totalVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const companyNitRaw = getSetting("company_nit", "900123456");
    const companyNit = companyNitRaw.split('-')[0].replace(/[^0-9]/g, '');
    
    $app.expandRecord(tx, ["tx_type_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const txTypeCode = txType ? txType.getString("code") : "";
    let docTypeCode = "01";
    if (txTypeCode === "ND") docTypeCode = "02";
    else if (txTypeCode === "NC") docTypeCode = "03";
    
    const commercialName = getSetting("company_name", "GRAVY S.A.S");
    const emailSubject = `${companyNit};${companyName};${docNumber};${docTypeCode};${commercialName};`;

    const einvoiceMethod = getSetting("einvoice_method", "dian");
    let integrationComment = "";
    if (einvoiceMethod === "facturatech") {
      integrationComment = "La integracion de datos es realizada por proveedor tecnologico CADENA S.A. / NIT. 890.930.534-0";
    } else {
      integrationComment = "La integracion de datos es realizada directamente por la UAE DIAN bajo la modalidad de software propio a nombre del emisor de este documento electronico";
    }

    let invoiceData = null;
    try {
      let invRec = null;
      let isPurchase = false;
      try {
        invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        try {
          invRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
          isPurchase = true;
        } catch (_2) {}
      }

      if (invRec) {
        let linesList = [];
        if (!isPurchase) {
          linesList = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invRec.id + "'");
        } else {
          linesList = $app.findRecordsByFilter("purchase_invoice_lines", "purchase_invoice_id = '" + invRec.id + "'");
        }
        
        $app.expandRecords(linesList, ["product_id"], null);
        const linesData = [];
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const prod = l.expandedOne("product_id");
          linesData.push({
            desc: prod ? prod.getString("name") : "Producto",
            code: prod ? prod.getString("code") : "—",
            qty: l.getFloat("qty") || 0,
            unitPrice: l.getFloat("unit_price") || 0,
            lineTotal: l.getFloat("total") || 0,
            ivaRate: l.getFloat("iva_rate") || 0
          });
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = customer ? customer.getString("name") : "Consumidor Final";
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        // Cashier name resolution
        let cajeroName = "Admin";
        const posShiftId = invRec.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        // Fetch resolution info
        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = invRec.getString("pos_shift_id") ? "POS" : "FV";
        
        try {
          const registerId = invRec.getString("pos_shift_id") ? ($app.findRecordById("pos_shifts", invRec.getString("pos_shift_id")).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: invRec.getString("payment_method") || "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      } else {
        // Fallback for POS/other transactions that might not have a record in invoices or purchase_invoices
        const linesList = $app.findRecordsByFilter("tx_lines", "tx_id = '" + txId + "'", "line_order");
        const linesData = [];
        let totalFromLines = 0;
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const d = l.getFloat("debit");
          const c = l.getFloat("credit");
          const amount = d > 0 ? d : c;
          if (amount > 0) {
            linesData.push({
              desc: l.getString("description") || "Concepto Contable",
              code: "—",
              qty: 1,
              unitPrice: amount,
              lineTotal: amount,
              ivaRate: 0
            });
            totalFromLines += amount;
          }
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = customer ? customer.getString("name") : "Consumidor Final";
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        // Cashier name resolution for fallback
        let cajeroName = "Admin";
        const posShiftId = tx.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        // Fetch resolution info
        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = posShiftId ? "POS" : "FV";
        
        try {
          const registerId = posShiftId ? ($app.findRecordById("pos_shifts", posShiftId).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal || totalFromLines,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      }
    } catch (errData) {
      console.warn("[GRAVY HOOK] Error al preparar structured invoiceData:", errData);
    }

    try {
      if (typeof syncSmtpSettings === 'function') {
        syncSmtpSettings();
      }
    } catch (e) {
      console.warn("[GRAVY] Error syncing SMTP settings:", e);
    }

    let zipPath = "";
    try {
      const zipRes = $http.send({
        url: "http://127.0.0.1:8088/api/dian/generate-zip-file",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlContent: xmlContent, filename: docNumber, invoiceData: invoiceData })
      });
      if (zipRes.statusCode === 200) {
        const zipData = JSON.parse(zipRes.raw);
        if (zipData.success) {
          zipPath = zipData.zipPath;
        }
      }
    } catch (err) {
      console.error("[GRAVY HOOK] Error al generar ZIP en el orquestador:", err);
    }
    
    const message = new MailerMessage({
      from: {
        address: companyEmail,
        name: companyName
      },
      to: [{ address: custEmail }],
      subject: emailSubject,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="cid:gravy-logo.png" alt="GRAVY Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: #E0F2FE; color: #0369A1; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                Documento Oficial DIAN
              </span>
            </div>
            
            <h2 style="color: #0F172A; font-size: 22px; font-weight: 800; text-align: center; margin-top: 12px; margin-bottom: 8px;">
              ¡Tu Factura Electrónica está lista!
            </h2>
            <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
              Emitida por <strong>${companyName}</strong>
            </p>
            
            <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
              <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
                Estimado cliente <strong>${customer.getString("name")}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
                Adjunto en este correo encontrará el archivo comprimido <strong>ZIP</strong> que contiene el XML firmado y la representación gráfica en formato PDF correspondientes a la <strong>Factura Electrónica de Venta No. ${docNumber}</strong>.
              </p>
            </div>
            
            <h3 style="color: #0F172A; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
              Detalles del Documento
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Número de Documento:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Fecha de Emisión:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${tx.getString("date")}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Monto Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284C7; border-bottom: 1px solid #F1F5F9;">${fmtTotal}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; vertical-align: top;">CUFE / CUDE:</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                  ${docRecord.getString("cufe") || 'N/A'}
                </td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 13px; color: #94A3B8; margin: 0;">
                Gracias por su preferencia y confianza.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
            <p style="font-size: 11px; color: #94A3B8; line-height: 1.5; margin: 0;">
              ${integrationComment}
            </p>
            <p style="font-size: 10px; color: #CBD5E1; margin-top: 12px; margin-bottom: 0;">
              Este es un mensaje automático generado por GRAVY. Por favor no responda a este correo.
            </p>
          </div>
        </div>
      `,
    });
    
    const attachments = {};
    if (zipPath) {
      try {
        const zipFile = $filesystem.fileFromPath(zipPath);
        attachments[`${docNumber}.zip`] = zipFile.reader.open();
      } catch (zipErr) {
        console.error("[GRAVY HOOK] No se pudo abrir el archivo ZIP generado:", zipErr);
        const xmlFile = $filesystem.fileFromBytes(xmlContent, `${docNumber}.xml`);
        attachments[`${docNumber}.xml`] = xmlFile.reader.open();
      }
    } else {
      const xmlFile = $filesystem.fileFromBytes(xmlContent, `${docNumber}.xml`);
      attachments[`${docNumber}.xml`] = xmlFile.reader.open();
    }

    try {
      const logoFile = $filesystem.fileFromPath("pb_public/assets/gravy-logo.png");
      attachments["gravy-logo.png"] = logoFile.reader.open();
    } catch (logoErr) {
      console.warn("[GRAVY HOOK] No se pudo adjuntar el logo de GRAVY:", logoErr);
    }
    
    message.attachments = attachments;
    
    $app.newMailClient().send(message);
    
    e.json(200, { success: true, message: "Correo reenviado exitosamente a " + custEmail });
  } catch (err) {
    console.error("[GRAVY HOOK] Error al reenviar correo:", err);
    e.json(500, { message: "Error al reenviar correo: " + err.message });
  }
});


