// Unit test for payload construction logic against MATIAS API rules

function buildMockPayload(docType, sinReferencia, parentDoc) {
  const isNC = docType === 'NC';
  const isND = docType === 'ND';
  const isPOS = docType === 'POS';
  const isDS = docType === 'DS';
  const isNDS = docType === 'NDS';

  let matiasEndpoint = "/invoice";
  let matiasTypeDocId = 7;
  let matiasOperationTypeId = 1;

  if (isPOS) {
    matiasTypeDocId = 20;
    matiasOperationTypeId = 1;
  } else if (isNDS) {
    matiasEndpoint = "/ds/adjustment-note";
    matiasTypeDocId = 15;
    matiasOperationTypeId = 1;
  } else if (isNC) {
    matiasEndpoint = "/notes/credit";
    matiasTypeDocId = 5;
    matiasOperationTypeId = sinReferencia ? 15 : 12;
  } else if (isND) {
    matiasEndpoint = "/notes/debit";
    matiasTypeDocId = 4;
    matiasOperationTypeId = sinReferencia ? 16 : 14;
  } else if (isDS) {
    matiasEndpoint = "/ds/document";
    matiasTypeDocId = 11;
    matiasOperationTypeId = 9;
  }

  const payload = {
    endpoint: matiasEndpoint,
    type_document_id: matiasTypeDocId,
    operation_type_id: matiasOperationTypeId,
    document_number: "466",
    prefix: "NC"
  };

  if (isNC || isND || isNDS) {
    if ((isNC || isND) && sinReferencia) {
      delete payload.billing_reference;
      let discrepancyCode = "5";
      payload.discrepancy_response = {
        reference_id: "NC466",
        response_id: String(discrepancyCode),
        description: "Nota sin referencia a facturas"
      };
    } else {
      payload.billing_reference = {
        number: parentDoc ? parentDoc.number : "FV1",
        date: parentDoc ? parentDoc.date : "2026-11-03",
        uuid: parentDoc ? parentDoc.cufe : "0598122411a5...",
        scheme_name: isNDS ? "CUDS-SHA384" : "CUFE-SHA384"
      };
      payload.discrepancy_response = {
        reference_id: parentDoc ? parentDoc.number : "FV1",
        response_id: "1",
        description: "Devolución parcial de los bienes"
      };
    }
  }

  return payload;
}

console.log("=== TEST 1: NC CON REFERENCIA ===");
const ncConRef = buildMockPayload('NC', false, { number: 'FV3940', date: '2026-11-03', cufe: '0598122411a56c...' });
console.log(JSON.stringify(ncConRef, null, 2));

console.log("\n=== TEST 2: NC SIN REFERENCIA ===");
const ncSinRef = buildMockPayload('NC', true);
console.log(JSON.stringify(ncSinRef, null, 2));

console.log("\n=== TEST 3: ND CON REFERENCIA ===");
const ndConRef = buildMockPayload('ND', false, { number: 'FV3940', date: '2026-11-03', cufe: '0598122411a56c...' });
console.log(JSON.stringify(ndConRef, null, 2));

console.log("\n=== TEST 4: ND SIN REFERENCIA ===");
const ndSinRef = buildMockPayload('ND', true);
console.log(JSON.stringify(ndSinRef, null, 2));

// Validations:
const asserts = [
  ncConRef.operation_type_id === 12 && ncConRef.type_document_id === 5 && !!ncConRef.billing_reference,
  ncSinRef.operation_type_id === 15 && ncSinRef.type_document_id === 5 && !ncSinRef.billing_reference && ncSinRef.discrepancy_response.response_id === "5",
  ndConRef.operation_type_id === 14 && ndConRef.type_document_id === 4 && !!ndConRef.billing_reference,
  ndSinRef.operation_type_id === 16 && ndSinRef.type_document_id === 4 && !ndSinRef.billing_reference && ndSinRef.discrepancy_response.response_id === "5"
];

console.log("\nAll Assertions Passed:", asserts.every(Boolean));

