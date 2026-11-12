const fs = require('fs');
const str = fs.readFileSync('scratch/matias_docs.json', 'utf8');

let idx = 0;
while ((idx = str.indexOf('"start_date"', idx)) !== -1) {
  console.log("=== MATCH ===");
  console.log(str.substring(idx - 300, idx + 200));
  idx += 15;
}

