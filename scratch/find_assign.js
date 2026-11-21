const fs = require('fs');
const content = fs.readFileSync('frontend/src/modules/copropiedades.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('rawActiveParties =') || line.includes('rawCarteraList =') || line.includes('rawSysIntegrityInfo =')) {
    console.log(`L${index + 1}: ${line.trim()}`);
  }
});
