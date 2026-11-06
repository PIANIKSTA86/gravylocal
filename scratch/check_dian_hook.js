const fs = require('fs');

const content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const lines = content.split('\n');

console.log('Searching NominaIndividualDeAjuste in dian.pb.js...');
lines.forEach((l, idx) => {
  if (l.includes('NominaIndividualDeAjuste') || l.includes('payroll_adjust') || l.includes('ajuste_nomina') || l.includes('eliminar_nomina')) {
    console.log(`Line ${idx + 1}: ${l.trim().slice(0, 140)}`);
  }
});

