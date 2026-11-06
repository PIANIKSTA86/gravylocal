const fs = require('fs');

const content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const lines = content.split('\n');

console.log('Searching for /api/dian/nomina in dian.pb.js...');
lines.forEach((l, idx) => {
  if (l.includes("routerAdd") && (l.includes("nomina") || l.includes("payroll"))) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});

