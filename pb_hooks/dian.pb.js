/// <reference path="../pb_data/types.d.ts" />

function getSetting(key, fallback) {
  try {
    const r = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
    return r.get("value") || fallback;
  } catch (_) {
    return fallback;
  }
}

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

function buildUblXml({
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
  softwareId
}) {
  const dec = (val) => Number(val || 0).toFixed(2);
  const escXml = (val) => String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
    
  const typeCode = documentType === 'Invoice' ? '01' : (documentType === 'CreditNote' ? '91' : '92');
  
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
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">10</cbc:CustomizationID>
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
        <cbc:CompanyID schemeAgencyID="195" schemeID="4" schemeName="31">${escXml(emitterNit)}</cbc:CompanyID>
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
        <cbc:CompanyID schemeAgencyID="195" schemeID="4" schemeName="${custDIANDocType}">${escXml(custDocNum)}</cbc:CompanyID>
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

routerAdd('POST', '/api/dian/emit', (e) => {
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
    
    if (!isPOS && !isNC && !isND && !isFV) {
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
    
    let invoice = null;
    try {
      invoice = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
    } catch (_) {}
    
    const emitterNit = getSetting("dian_nit", getSetting("company_nit", "900123456"));
    const emitterName = getSetting("company_name", "GRAVY CORP SAS");
    const emitterAddress = getSetting("company_address", "Calle 1 # 2 - 3");
    const emitterPhone = getSetting("company_phone", "601-555-0100");
    const emitterEmail = getSetting("company_email", "dian@gravy.com");
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
    
    if (invoice) {
      subtotal = invoice.getFloat("subtotal");
      ivaTotal = invoice.getFloat("iva_total");
      total = invoice.getFloat("total");
      
      const lines = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invoice.id + "'", "line_order");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        items.push({
          id: String(i + 1),
          description: line.getString("description") || "Producto/Servicio",
          qty: line.getFloat("qty") || 1,
          price: line.getFloat("unit_price") || 0,
          ivaRate: line.getFloat("iva_rate") || 0,
          ivaAmount: line.getFloat("iva_amount") || 0,
          subtotal: line.getFloat("subtotal") || 0,
          total: line.getFloat("total") || 0
        });
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
    
    const xml = buildUblXml({
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
      softwareId
    });
    
    // Call Hub
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
