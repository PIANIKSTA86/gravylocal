const fs = require('fs');

const content = fs.readFileSync('frontend/src/modules/nomina.ts', 'utf8');
const lines = content.split('\n');

console.log('Searching for withholding_tax / retencion calculation in nomina.ts...');
lines.forEach((l, idx) => {
  if (l.includes('withholding_tax') || l.includes('calcWithholding') || l.includes('retencion') || l.includes('solidarity_fund')) {
    if (l.includes('function') || l.includes('const ') || l.includes('let ') || l.includes('return ') || l.includes('ibc')) {
      console.log(`Line ${idx + 1}: ${l.trim().slice(0, 120)}`);
    }
  }
});

