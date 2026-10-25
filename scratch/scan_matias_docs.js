const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));
const str = JSON.stringify(spec);
let pos = 0;
const results = [];
while ((pos = str.indexOf('payment', pos + 1)) !== -1) {
  results.push(str.slice(Math.max(0, pos - 40), Math.min(str.length, pos + 80)));
}
console.log('Total occurrences:', results.length);
results.forEach((r, i) => console.log(`${i+1}: ${r}`));
