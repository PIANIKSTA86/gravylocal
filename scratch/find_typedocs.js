const fs = require('fs');
const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));

const typeDocPaths = Object.keys(docs.paths).filter(p => p.includes('type') || p.includes('document'));
console.log("Matching paths:", typeDocPaths);

// Check components schemas for TypeDocument or similar
const schemas = Object.keys(docs.components.schemas).filter(s => /document|type/i.test(s));
console.log("Matching schemas:", schemas);

