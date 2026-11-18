const fs = require('fs');
const content = fs.readFileSync('DatosReferencia/apiMatias/# MATIAS API UBL 2.1.txt', 'utf8');

// Find sections around document-receptions
const p1 = content.indexOf('GET /document-receptions');
if (p1 !== -1) {
  console.log('--- GET /document-receptions ---');
  console.log(content.slice(p1, p1 + 3500));
}

const p2 = content.indexOf('GET /document-receptions/{documentId}/files');
if (p2 !== -1) {
  console.log('--- GET /document-receptions/{documentId}/files ---');
  console.log(content.slice(p2, p2 + 3500));
}
