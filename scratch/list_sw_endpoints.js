const fs = require('fs');
const content = fs.readFileSync('scratch/matias_docs.json', 'utf8');
const matches = content.match(/"\/api\/ubl2.1\/software[^"]*"/g) || [];
console.log('Software endpoints:', [...new Set(matches)]);
