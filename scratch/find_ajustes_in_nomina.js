const fs = require('fs');

const content = fs.readFileSync('frontend/src/modules/nomina.ts', 'utf8');
const lines = content.split('\n');

console.log('Searching for "nota de ajuste", "NominaIndividualDeAjuste", "ajuste" in nomina.ts...');
lines.forEach((l, idx) => {
  if (
    l.toLowerCase().includes('ajuste') || 
    l.toLowerCase().includes('nane') ||
    l.toLowerCase().includes('reemplazar') ||
    l.toLowerCase().includes('eliminar')
  ) {
    if (l.includes('function ') || l.includes('const ') || l.includes('button') || l.includes('modal') || l.includes('xml') || l.includes('UBL') || l.includes('dian')) {
      console.log(`Line ${idx + 1}: ${l.trim().slice(0, 130)}`);
    }
  }
});

