const fs = require('fs');

const payloads = JSON.parse(fs.readFileSync('scratch/september_matias_payloads.json', 'utf8'));
console.log("Keys in september payloads:", Object.keys(payloads));
for (const k of Object.keys(payloads)) {
  console.log(k, Array.isArray(payloads[k]) ? payloads[k].length : typeof payloads[k]);
}
if (payloads.credit_notes || payloads.notes) {
  console.log(JSON.stringify(payloads.credit_notes || payloads.notes, null, 2).substring(0, 500));
}

