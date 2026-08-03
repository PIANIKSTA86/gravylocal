const fs = require('fs');

// Simple mock/harness to run buildFtechXml from dian.pb.js
const code = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');

// Extract buildFtechXml function definition
const match = code.match(/function buildFtechXml\(\{[\s\S]*?\n\}/);
if (!match) {
  console.error("Could not find buildFtechXml in dian.pb.js");
  process.exit(1);
}

// Create a function runner
const fnCode = match[0];
const evalFn = new Function('data', `
  const escXml = (val) => String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  const dec = (val) => Number(val || 0).toFixed(2);
  const decPrice = (val, qty, subtotal) => Number(val || 0).toFixed(2);

  const {
    documentType,
    documentNumber,
    issueDate,
    dueDate,
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
    mandante,
    isDS,
    isNDS,
    sinReferencia,
    txDescription
  } = data;

  const isNC = (documentType === 'CreditNote');
  const isND = (documentType === 'DebitNote');
  const rootTag = (isNC || isND) ? 'NOTA' : (isDS ? 'DOCUMENTO_SOPORTE' : 'FACTURA');

  const enc1 = isDS ? 'DS' : (isNC ? 'NC' : (isND ? 'ND' : 'INVOIC'));
  const enc2 = escXml(emitterNit);
  const enc3 = escXml(isDS || isNDS ? emitterNit : custDocNum);
  const enc4 = 'UBL 2.1';
  const enc5 = 'DIAN 2.1';
  const enc6DocPrefix = prefix || 'NCG';
  const enc6 = escXml(enc6DocPrefix + folio);
  const enc9 = isNC ? '91' : (isND ? '92' : '01');
  const enc10 = 'COP';
  const enc15 = String(items.length);
  const enc16 = dueDate ? String(dueDate).slice(0, 10) : issueDate;
  const enc20 = escXml(ftechEnvironment || '1');
  const enc21 = isNC ? (sinReferencia ? '22' : '20') : (isND ? (sinReferencia ? '32' : '30') : '10');

  const yStr = issueDate ? issueDate.slice(0, 4) : new Date().getFullYear().toString();
  const mStr = issueDate ? issueDate.slice(5, 7) : String(new Date().getMonth() + 1).padStart(2, '0');
  const enc11 = \`\${yStr}-\${mStr}-01\`;
  const lastDayNum = new Date(Number(yStr), Number(mStr), 0).getDate();
  const enc12 = \`\${yStr}-\${mStr}-\${String(lastDayNum).padStart(2, '0')}\`;

  let xml = \`<?xml version="1.0" encoding="UTF-8"?>
 <\${rootTag}>
 <ENC>
       <ENC_1>\${enc1}</ENC_1>
       <ENC_2>\${enc2}</ENC_2>
       <ENC_3>\${enc3}</ENC_3>
       <ENC_4>\${enc4}</ENC_4>
       <ENC_5>\${enc5}</ENC_5>
       <ENC_6>\${enc6}</ENC_6>
       <ENC_7>\${issueDate}</ENC_7>
       <ENC_8>\${issueTime}</ENC_8>
       <ENC_9>\${enc9}</ENC_9>
       <ENC_10>\${enc10}</ENC_10>
       \${(isNC || isND) && sinReferencia ? \`<ENC_11>\${enc11}</ENC_11>\\n       <ENC_12>\${enc12}</ENC_12>\` : ''}
       <ENC_15>\${enc15}</ENC_15>
       <ENC_16>\${enc16}</ENC_16>
       <ENC_20>\${enc20}</ENC_20>
       <ENC_21>\${enc21}</ENC_21>
 </ENC>\`;

  if ((isNC || isND) && crossDocRef && !sinReferencia) {
    xml += \`
 <REF>
       <REF_1>IV</REF_1>
       <REF_2>\${crossDocRef}</REF_2>
       <REF_3>2024-10-11</REF_3>
       <REF_4>8f9ac4c893e09dc873651c6b11a4b7cfb458f293197f6ffa491b43f32308949a4585adfd142745870513dcb76cb15f1c</REF_4>
       <REF_5>CUFE-SHA384</REF_5>
 </REF>\`;
  }

  if ((isNC || isND) && sinReferencia) {
    xml += \`
 <NOT>
       <NOT_1>2</NOT_1>
 </NOT>\`;
  }

  if ((isNC || isND) && sinReferencia) {
    xml += \`
 <MEP>
       <MEP_1>ZZZ</MEP_1>
       <MEP_2>1</MEP_2>
       <MEP_3>\${issueDate}</MEP_3>
 </MEP>\`;
  } else {
    xml += \`
 <MEP>
       <MEP_1>1</MEP_1>
       <MEP_2>2</MEP_2>
       <MEP_3>2026-08-06</MEP_3>
 </MEP>\`;
  }

  if (isNC || isND) {
    let cdn1 = sinReferencia ? '5' : '1';
    let cdn2 = sinReferencia ? 'Otros' : 'Ajuste de Factura por informacion erronea en el documento';
    xml += \`
 <CDN>
       <CDN_1>\${cdn1}</CDN_1>
       <CDN_2>\${cdn2}</CDN_2>
 </CDN>\`;

    if (sinReferencia) {
      xml += \`
 <SNO>
       <SNO_1>Y</SNO_1>
 </SNO>\`;
    }
  }

  return xml;
`);

const sampleWithRef = {
  documentType: 'CreditNote',
  documentNumber: 'NCG123',
  issueDate: '2026-07-30',
  dueDate: '2026-07-31',
  issueTime: '06:00:22-05:00',
  ftechEnvironment: '1',
  emitterNit: '900007450',
  custDocNum: '94370519',
  prefix: 'NCG',
  folio: '123',
  crossDocRef: 'FE8173',
  sinReferencia: false,
  items: [{ subtotal: 31000, ivaAmount: 5890 }]
};

const sampleSinRef = {
  documentType: 'CreditNote',
  documentNumber: 'NCG345',
  issueDate: '2026-07-30',
  dueDate: '2026-07-31',
  issueTime: '05:49:35-05:00',
  ftechEnvironment: '1',
  emitterNit: '900007450',
  custDocNum: '94370519',
  prefix: 'NCG',
  folio: '345',
  crossDocRef: '',
  sinReferencia: true,
  items: [{ subtotal: 38750, ivaAmount: 7362.5 }]
};

console.log("=== XML CON REFERENCIA CUFE ===");
console.log(evalFn(sampleWithRef));

console.log("\n=== XML SIN REFERENCIA CUFE ===");
console.log(evalFn(sampleSinRef));
