const fs = require('fs');
const content = fs.readFileSync('frontend/src/modules/copropiedades.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('printPhInvoice')) {
    console.log(`L${i+1}: ${l}`);
  }
});
