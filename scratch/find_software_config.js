const fs = require('fs');
const content = fs.readFileSync('scratch/matias_docs.json', 'utf8');

const idx = content.indexOf('testsetid');
console.log(content.substring(Math.max(0, idx - 1500), idx + 100));
