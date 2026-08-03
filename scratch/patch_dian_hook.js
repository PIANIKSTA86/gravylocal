const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_hooks/dian.pb.js';

let content = fs.readFileSync(path, 'utf8');

const target = `  </cac:AccountingCustomerParty>\`;

  xml += \`
  <cac:TaxTotal>`;

const replacement = `  </cac:AccountingCustomerParty>\`;

  const payForm = invRec.getString("payment_form") || (invRec.getString("payment_method") === "CREDITO" ? "2" : "1");
  const payDianCode = invRec.getString("payment_dian_code") || (invRec.getString("payment_method") === "CREDITO" ? "30" : "10");
  const dueDateVal = invRec.getString("due_date") ? invRec.getString("due_date").slice(0, 10) : issueDate;

  xml += \`
  <cac:PaymentMeans>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansCode>\${payDianCode}</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>\${dueDateVal}</cbc:PaymentDueDate>
  </cac:PaymentMeans>
  
  <cac:PaymentTerms>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansID>\${payForm}</cbc:PaymentMeansID>
    \${payForm === '2' ? \`<cbc:Amount currencyID="COP">\${dec(total)}</cbc:Amount>
    <cbc:PaymentDueDate>\${dueDateVal}</cbc:PaymentDueDate>\` : ''}
  </cac:PaymentTerms>\`;

  xml += \`
  <cac:TaxTotal>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("SUCCESS: UBL payment tags patch applied to pb_hooks/dian.pb.js!");
} else {
  console.error("ERROR: Target block not found in pb_hooks/dian.pb.js!");
}
