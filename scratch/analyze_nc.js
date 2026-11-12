const fs = require('fs');
const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));
const schemas = Object.keys(docs.components.schemas);
console.log('Schemas matching note/credit/billing/discrepancy:', schemas.filter(s => /credit|note|billing|discrepancy|reference/i.test(s)));

// Also search for "discrepancy_response" anywhere in docs
const str = fs.readFileSync('scratch/matias_docs.json', 'utf8');
let idx = 0;
while ((idx = str.indexOf('discrepancy_response', idx)) !== -1) {
  console.log('Found discrepancy_response at:', idx, str.substring(idx - 100, idx + 200));
  idx += 20;
}
idx = 0;
while ((idx = str.indexOf('billing_reference', idx)) !== -1) {
  console.log('Found billing_reference at:', idx, str.substring(idx - 100, idx + 200));
  idx += 17;
}
