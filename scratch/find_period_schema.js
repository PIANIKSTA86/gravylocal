const fs = require('fs');

const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));
const str = fs.readFileSync('scratch/matias_docs.json', 'utf8');

console.log("Searching for period in schemas...");
const schemas = Object.keys(docs.components.schemas).filter(s => /period/i.test(s));
console.log("Period schemas:", schemas);

let idx = 0;
while ((idx = str.indexOf('billing_period', idx)) !== -1) {
  console.log("billing_period found at:", str.substring(idx - 100, idx + 150));
  idx += 15;
}
idx = 0;
while ((idx = str.indexOf('invoice_period', idx)) !== -1) {
  console.log("invoice_period found at:", str.substring(idx - 100, idx + 150));
  idx += 15;
}

