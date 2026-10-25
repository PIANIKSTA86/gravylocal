const fs = require('fs');
const content = fs.readFileSync('ARQUITECTURA_BASE_DATOS_MOVIL.md', 'utf-8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.toLowerCase().includes('vendedor') || l.toLowerCase().includes('seller') || l.toLowerCase().includes('empleado')) {
    console.log(`${idx + 1}: ${l}`);
  }
});
