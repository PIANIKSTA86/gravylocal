const fs = require('fs');
const content = fs.readFileSync('DatosReferencia/apiMatias/# MATIAS API UBL 2.1.txt', 'utf8');

function findSection(pattern, length = 120) {
  const idx = content.indexOf(pattern);
  if (idx !== -1) {
    console.log(`\n=================== FOUND: ${pattern} ===================`);
    console.log(content.slice(idx, idx + length * 80));
  } else {
    console.log(`\nNOT FOUND: ${pattern}`);
  }
}

findSection('/import-excel', 40);
findSection('/import-track-id', 40);
findSection('document-receptions/{documentId}/files', 60);
findSection('GET /events/document-receptions', 40);
findSection('document-receptions', 40);
