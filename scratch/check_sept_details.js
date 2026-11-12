const fs = require('fs');
const payloads = JSON.parse(fs.readFileSync('scratch/september_matias_payloads.json', 'utf8'));
console.log("Keys of 0:", Object.keys(payloads[0]));
console.log("Sample of 0:", JSON.stringify(payloads[0], null, 2).substring(0, 500));
