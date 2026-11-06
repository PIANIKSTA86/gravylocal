const fs = require('fs');

const content = fs.readFileSync('hub/orchestrator.js', 'utf8');
const lines = content.split('\n');

console.log('Searching "upload-and-send" and Nomina in orchestrator.js...');
lines.forEach((l, idx) => {
  if (l.includes('upload-and-send') || l.includes('NominaIndividual') || l.includes('NominaIndividualDeAjuste') || l.includes('isNomina')) {
    console.log(`Line ${idx + 1}: ${l.trim().slice(0, 130)}`);
  }
});

