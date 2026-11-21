const fs = require('fs');
const path = require('path');

function searchInFile(filePath, term) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes(term.toLowerCase())) {
      console.log(`Found "${term}" in ${filePath}`);
    }
  } catch (e) {}
}

// search in frontend/src/modules/copropiedades.ts
const code = fs.readFileSync('frontend/src/modules/copropiedades.ts', 'utf8');
const lines = code.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('Total general') || l.includes('report-ph-cartera') || l.includes('grandExigible') || l.includes('grandNeto') || l.includes('105 unidades') || l.includes('Mora') && l.includes('Capital')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
