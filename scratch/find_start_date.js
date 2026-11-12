const fs = require('fs');
const str = fs.readFileSync('scratch/matias_docs.json', 'utf8');

let idx = 0;
while ((idx = str.indexOf('start_date', idx)) !== -1) {
  console.log("start_date found at:", str.substring(idx - 100, idx + 150));
  idx += 15;
}

