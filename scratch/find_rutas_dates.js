const fs = require('fs');
const content = fs.readFileSync('frontend/src/modules/rutas-visitas.ts', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('toISOString') || line.includes('activeDate') || line.includes('visit_date')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
