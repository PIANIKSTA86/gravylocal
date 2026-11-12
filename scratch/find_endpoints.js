const fs = require('fs');
const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));

const docPaths = Object.keys(docs.paths).filter(p => p.includes('download') || p.includes('xml') || p.includes('status') || p.includes('credit'));
console.log("Matching paths:", docPaths);

