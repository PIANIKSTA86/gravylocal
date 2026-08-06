const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function escXml(val) {
  return String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function dec(val) {
  return Number(val || 0).toFixed(2);
}

async function testRealFtechXml() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    const txId = 'qx1d9gsts97jp4q'; // FV-00003785
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(txId);
    const invoice = db.prepare("SELECT * FROM invoices WHERE tx_id = ?").get(txId);
    const customer = db.prepare("SELECT * FROM third_parties WHERE id = ?").get(tx.third_party_id);
    const company = db.prepare("SELECT * FROM third_parties WHERE id = '6rrkkgueqzgorkj'").get();
    const resolution = db.prepare("SELECT * FROM dian_resolutions WHERE active = 1 AND prefix = 'FV' AND document_type = 'FV'").get();

    const lines = db.prepare("SELECT * FROM invoice_lines WHERE invoice_id = ?").all(invoice.id);
    const items = lines.map((l, i) => {
      const prod = db.prepare("SELECT * FROM products WHERE id = ?").get(l.product_id);
      return {
        id: String(i + 1),
        description: prod ? prod.name : 'Producto',
        qty: l.qty,
        price: l.unit_price,
        ivaRate: l.iva_rate,
        ivaAmount: l.iva_amount,
        subtotal: l.subtotal,
        total: l.total,
        code: prod ? prod.code : 'SW3200',
        unit: prod ? prod.unit : 'MTK'
      };
    });

    const issueDate = tx.date;
    const issueTime = '12:00:00-05:00';
    const docNumber = tx.number; // FV-00003785
    const folio = '3785';
    const prefix = 'FV';
    const emitterNit = '901428834';
    const emitterName = company ? company.name : 'DOMESTIKO SAS';
    const emitterAddress = company ? company.address : 'CL 29 5 50';
    const emitterPhone = company ? company.phone : '3004205403';
    const emitterEmail = 'facturacion@domestiko.com';

    const custDocNum = customer.doc_number;
    const custName = customer.name;
    const custAddress = customer.address;
    const custPhone = customer.phone;
    const custEmail = customer.email;
    const custDIANDocType = '31'; // NIT

    const subtotal = invoice.subtotal;
    const ivaTotal = invoice.iva_total;
    const total = invoice.total;

    // Build Facturatech XML with CDE node
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<FACTURA>
  <ENC>
    <ENC_1>INVOIC</ENC_1>
    <ENC_2>${escXml(emitterNit)}</ENC_2>
    <ENC_3>${escXml(custDocNum)}</ENC_3>
    <ENC_4>UBL 2.1</ENC_4>
    <ENC_5>DIAN 2.1</ENC_5>
    <ENC_6>${escXml(docNumber)}</ENC_6>
    <ENC_7>${issueDate}</ENC_7>
    <ENC_8>${issueTime}</ENC_8>
    <ENC_9>01</ENC_9>
    <ENC_10>COP</ENC_10>
    <ENC_15>${items.length}</ENC_15>
    <ENC_16>${issueDate}</ENC_16>
    <ENC_20>1</ENC_20>
    <ENC_21>10</ENC_21>
  </ENC>
  <EMI>
    <EMI_1>1</EMI_1>
    <EMI_2>${escXml(emitterNit)}</EMI_2>
    <EMI_3>31</EMI_3>
    <EMI_6>${escXml(emitterName)}</EMI_6>
    <EMI_7>${escXml(emitterName)}</EMI_7>
    <EMI_10>${escXml(emitterAddress)}</EMI_10>
    <EMI_11>76</EMI_11>
    <EMI_13>CALI - 76001</EMI_13>
    <EMI_14>760001</EMI_14>
    <EMI_15>CO</EMI_15>
    <EMI_18>2</EMI_18>
    <EMI_22>901428834</EMI_22>
    <EMI_23>76001</EMI_23>
    <EMI_24>${escXml(emitterName)}</EMI_24>
    <TAC>
      <TAC_1>R-99-PN</TAC_1>
    </TAC>
    <DFE>
      <DFE_1>76001</DFE_1>
      <DFE_2>76</DFE_2>
      <DFE_3>CO</DFE_3>
      <DFE_4>760001</DFE_4>
      <DFE_5>Colombia</DFE_5>
      <DFE_6>VALLE DEL CAUCA</DFE_6>
      <DFE_7>CALI</DFE_7>
      <DFE_8>${escXml(emitterAddress)}</DFE_8>
    </DFE>
    <CDE>
      <CDE_2>${escXml(emitterName)}</CDE_2>
      <CDE_3>${escXml(emitterPhone)}</CDE_3>
      <CDE_4>${escXml(emitterEmail)}</CDE_4>
    </CDE>
    <GTE>
      <GTE_1>01</GTE_1>
      <GTE_2>IVA</GTE_2>
    </GTE>
  </EMI>
  <ADQ>
    <ADQ_1>1</ADQ_1>
    <ADQ_2>${escXml(custDocNum)}</ADQ_2>
    <ADQ_3>${custDIANDocType}</ADQ_3>
    <ADQ_6>${escXml(custName)}</ADQ_6>
    <ADQ_7>${escXml(custName)}</ADQ_7>
    <ADQ_10>${escXml(custAddress)}</ADQ_10>
    <ADQ_11>76</ADQ_11>
    <ADQ_13>CALI - 76001</ADQ_13>
    <ADQ_14>760001</ADQ_14>
    <ADQ_15>CO</ADQ_15>
    <ADQ_22>${escXml(custDocNum)}</ADQ_22>
    <TCA>
      <TCA_1>R-99-PN</TCA_1>
    </TCA>
    <ICR>
      <ICR_1>Consumidor Final</ICR_1>
    </ICR>
    <CDA>
      <CDA_1>1</CDA_1>
      <CDA_2>${escXml(custName)}</CDA_2>
      <CDA_3>${escXml(custPhone)}</CDA_3>
      <CDA_4>${escXml(custEmail)}</CDA_4>
    </CDA>
    <GTE>
      <GTE_1>01</GTE_1>
      <GTE_2>IVA</GTE_2>
    </GTE>
  </ADQ>
  <TOT>
    <TOT_1>${dec(subtotal)}</TOT_1>
    <TOT_2>COP</TOT_2>
    <TOT_3>${dec(subtotal)}</TOT_3>
    <TOT_4>COP</TOT_4>
    <TOT_5>${dec(total)}</TOT_5>
    <TOT_6>COP</TOT_6>
    <TOT_7>${dec(total)}</TOT_7>
    <TOT_8>COP</TOT_8>
  </TOT>
  <TIM>
    <TIM_1>false</TIM_1>
    <TIM_2>${dec(ivaTotal)}</TIM_2>
    <TIM_3>COP</TIM_3>
    <IMP>
      <IMP_1>01</IMP_1>
      <IMP_2>${dec(subtotal)}</IMP_2>
      <IMP_3>COP</IMP_3>
      <IMP_4>${dec(ivaTotal)}</IMP_4>
      <IMP_5>COP</IMP_5>
      <IMP_6>19.0</IMP_6>
    </IMP>
  </TIM>
  <DRF>
    <DRF_1>${escXml(resolution.resolution_number)}</DRF_1>
    <DRF_2>${resolution.resolution_date.slice(0,10)}</DRF_2>
    <DRF_3>${resolution.expiration_date.slice(0,10)}</DRF_3>
    <DRF_4>${escXml(resolution.prefix)}</DRF_4>
    <DRF_5>${resolution.number_from}</DRF_5>
    <DRF_6>${resolution.number_to}</DRF_6>
  </DRF>
  <MEP>
    <MEP_1>47</MEP_1>
    <MEP_2>1</MEP_2>
  </MEP>`;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      xml += `
  <ITE>
    <ITE_1>${it.id}</ITE_1>
    <ITE_3>${dec(it.qty)}</ITE_3>
    <ITE_4>${escXml(it.unit)}</ITE_4>
    <ITE_5>${dec(it.subtotal)}</ITE_5>
    <ITE_6>COP</ITE_6>
    <ITE_7>${dec(it.price)}</ITE_7>
    <ITE_8>COP</ITE_8>
    <ITE_11>${escXml(it.description)}</ITE_11>
    <ITE_19>${dec(it.subtotal)}</ITE_19>
    <ITE_20>COP</ITE_20>
    <ITE_27>${dec(it.qty)}</ITE_27>
    <ITE_28>${escXml(it.unit)}</ITE_28>
    <IAE>
      <IAE_1>${escXml(it.code)}</IAE_1>
      <IAE_2>999</IAE_2>
    </IAE>
    <TII>
      <TII_1>${dec(it.ivaAmount)}</TII_1>
      <TII_2>COP</TII_2>
      <TII_3>false</TII_3>
      <IIM>
        <IIM_1>01</IIM_1>
        <IIM_2>${dec(it.ivaAmount)}</IIM_2>
        <IIM_3>COP</IIM_3>
        <IIM_4>${dec(it.subtotal)}</IIM_4>
        <IIM_5>COP</IIM_5>
        <IIM_6>19.0</IIM_6>
      </IIM>
    </TII>
  </ITE>`;
    }

    xml += `
</FACTURA>`;

    console.log("Sending XML with CDE node to Facturatech SOAP...");

    const xmlBase64 = Buffer.from(xml, 'utf8').toString('base64');
    const ftechPassword = "8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb";

    const soapEnv = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.uploadInvoiceFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">901428834</username>
         <password xsi:type="xsd:string">${ftechPassword}</password>
         <xmlBase64 xsi:type="xsd:string">${xmlBase64}</xmlBase64>
      </urn:FtechAction.uploadInvoiceFile>
   </soapenv:Body>
</soapenv:Envelope>`;

    const res = await fetch('https://ws.facturatech.co/v2/pro/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.uploadInvoiceFile'
      },
      body: soapEnv
    });

    console.log("Facturatech Response HTTP Status:", res.status);
    const soapResText = await res.text();
    console.log("Facturatech Response Raw XML:\n", soapResText);

  } catch (err) {
    console.error("Test error:", err);
  }
}

testRealFtechXml();
