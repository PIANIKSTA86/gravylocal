const fs = require('fs');
const all = JSON.parse(fs.readFileSync('scratch/september_matias_payloads.json', 'utf8'));

console.log('----------------------------------------------------');
console.log('PAYLOAD COMPLETO NOM-364 (AMPARO REYES SARRIA):');
console.log('----------------------------------------------------');
console.log(JSON.stringify(all[0].payload, null, 2));

console.log('\n----------------------------------------------------');
console.log('PAYLOAD COMPLETO NOM-371 (CATALINA MARTINEZ REYES):');
console.log('----------------------------------------------------');
console.log(JSON.stringify(all[7].payload, null, 2));

