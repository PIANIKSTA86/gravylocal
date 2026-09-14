// scratch/test_dian_payment_logic.js
const assert = require('assert');

function evaluatePaymentExtraction(invoice) {
  let paymentForm = "1";
  let paymentDianCode = "10";
  let paymentMethod = "EFECTIVO";
  if (invoice) {
    paymentForm = invoice.payment_form || (invoice.payment_method === "CREDITO" ? "2" : "1");
    paymentDianCode = invoice.payment_dian_code || (paymentForm === "2" ? "30" : (invoice.payment_method === "TRANSFERENCIA" ? "47" : "10"));
    paymentMethod = invoice.payment_method || (paymentForm === "2" ? "CREDITO" : "EFECTIVO");
  }
  return { paymentForm, paymentDianCode, paymentMethod };
}

function generateFtechMepBlock({ isDS, isNC, isND, sinReferencia, paymentForm, paymentDianCode, paymentMethod, dueDate, issueDate }) {
  const payForm = String(paymentForm || (paymentMethod === 'CREDITO' ? '2' : '1'));
  const payDianCode = String(paymentDianCode || (payForm === '2' ? '30' : (paymentMethod === 'TRANSFERENCIA' ? '47' : '10')));
  let mep1 = payDianCode;
  let mep2 = payForm;
  const dueDateVal = dueDate ? String(dueDate).slice(0, 10) : issueDate;

  let xml = '';
  if (isDS) {
    xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>${mep2}</MEP_2>
    <MEP_3>${mep2 === '2' ? dueDateVal : issueDate}</MEP_3>
  </MEP>`;
  } else if ((isNC || isND) && sinReferencia) {
    xml += `
  <MEP>
    <MEP_1>ZZZ</MEP_1>
    <MEP_2>1</MEP_2>
    <MEP_3>${issueDate}</MEP_3>
  </MEP>`;
  } else {
    if (mep2 === '2') {
      xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>2</MEP_2>
    <MEP_3>${dueDateVal}</MEP_3>
  </MEP>`;
    } else {
      xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>1</MEP_2>
  </MEP>`;
    }
  }
  return xml.trim();
}

function generateUblPaymentBlock({ paymentForm, paymentDianCode, paymentMethod, dueDate, issueDate, total }) {
  const payForm = String(paymentForm || (paymentMethod === "CREDITO" ? "2" : "1"));
  const payDianCode = String(paymentDianCode || (payForm === "2" ? "30" : (paymentMethod === "TRANSFERENCIA" ? "47" : "10")));
  const dueDateVal = dueDate ? String(dueDate).slice(0, 10) : issueDate;

  let xml = `
  <cac:PaymentMeans>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansCode>${payDianCode}</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${dueDateVal}</cbc:PaymentDueDate>
  </cac:PaymentMeans>
  
  <cac:PaymentTerms>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansID>${payForm}</cbc:PaymentMeansID>
    ${payForm === '2' ? `<cbc:Amount currencyID="COP">${Number(total).toFixed(2)}</cbc:Amount>
    <cbc:PaymentDueDate>${dueDateVal}</cbc:PaymentDueDate>` : ''}
  </cac:PaymentTerms>`;
  return xml.trim();
}

console.log("=== INICIANDO PRUEBAS DE LÓGICA DE PAGO EN XML ===");

// Caso 1: Factura de Venta a Crédito 30 días con medio 30
{
  const inv = { payment_form: '2', payment_dian_code: '30', payment_method: 'CREDITO', due_date: '2026-10-14' };
  const ext = evaluatePaymentExtraction(inv);
  assert.strictEqual(ext.paymentForm, '2');
  assert.strictEqual(ext.paymentDianCode, '30');

  const ftechXml = generateFtechMepBlock({
    ...ext,
    dueDate: inv.due_date,
    issueDate: '2026-09-14'
  });
  console.log("\n[Caso 1 - Facturatech Crédito 30 días]:\n" + ftechXml);
  assert(ftechXml.includes('<MEP_1>30</MEP_1>'), "Debe incluir MEP_1 = 30");
  assert(ftechXml.includes('<MEP_2>2</MEP_2>'), "Debe incluir MEP_2 = 2 (Crédito)");
  assert(ftechXml.includes('<MEP_3>2026-10-14</MEP_3>'), "Debe incluir fecha de vencimiento MEP_3");

  const ublXml = generateUblPaymentBlock({
    ...ext,
    dueDate: inv.due_date,
    issueDate: '2026-09-14',
    total: 150000
  });
  console.log("\n[Caso 1 - UBL Crédito 30 días]:\n" + ublXml);
  assert(ublXml.includes('<cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>'));
  assert(ublXml.includes('<cbc:PaymentMeansID>2</cbc:PaymentMeansID>'));
  assert(ublXml.includes('<cbc:PaymentDueDate>2026-10-14</cbc:PaymentDueDate>'));
  assert(ublXml.includes('<cbc:Amount currencyID="COP">150000.00</cbc:Amount>'));
}

// Caso 2: Factura de Venta Contado Transferencia (47)
{
  const inv = { payment_form: '1', payment_dian_code: '47', payment_method: 'TRANSFERENCIA', due_date: '2026-09-14' };
  const ext = evaluatePaymentExtraction(inv);
  const ftechXml = generateFtechMepBlock({
    ...ext,
    dueDate: inv.due_date,
    issueDate: '2026-09-14'
  });
  console.log("\n[Caso 2 - Facturatech Contado Transferencia]:\n" + ftechXml);
  assert(ftechXml.includes('<MEP_1>47</MEP_1>'));
  assert(ftechXml.includes('<MEP_2>1</MEP_2>'));
  assert(!ftechXml.includes('<MEP_3>'), "Contado no debe llevar MEP_3 obligatorio en Ftech");
}

// Caso 3: Documento Soporte a Crédito (isDS = true)
{
  const purInv = { payment_form: '2', payment_dian_code: '42', payment_method: 'CREDITO', due_date: '2026-10-30' };
  const ext = evaluatePaymentExtraction(purInv);
  const ftechXml = generateFtechMepBlock({
    isDS: true,
    ...ext,
    dueDate: purInv.due_date,
    issueDate: '2026-09-14'
  });
  console.log("\n[Caso 3 - Documento Soporte a Crédito]:\n" + ftechXml);
  assert(ftechXml.includes('<MEP_1>42</MEP_1>'));
  assert(ftechXml.includes('<MEP_2>2</MEP_2>'));
  assert(ftechXml.includes('<MEP_3>2026-10-30</MEP_3>'));
}

// Caso 4: Factura POS legado (solo payment_method = 'CREDITO')
{
  const posInv = { payment_method: 'CREDITO', due_date: '2026-10-14' };
  const ext = evaluatePaymentExtraction(posInv);
  assert.strictEqual(ext.paymentForm, '2', "Debe inferir paymentForm=2 si payment_method es CREDITO");
  assert.strictEqual(ext.paymentDianCode, '30', "Debe inferir paymentDianCode=30 si es crédito");
  const ftechXml = generateFtechMepBlock({
    ...ext,
    dueDate: posInv.due_date,
    issueDate: '2026-09-14'
  });
  console.log("\n[Caso 4 - POS Legado inferido]:\n" + ftechXml);
  assert(ftechXml.includes('<MEP_1>30</MEP_1>'));
  assert(ftechXml.includes('<MEP_2>2</MEP_2>'));
  assert(ftechXml.includes('<MEP_3>2026-10-14</MEP_3>'));
}

console.log("\n✅ TODAS LAS PRUEBAS DE LÓGICA DE PAGO PASARON SATISFACTORIAMENTE!");
