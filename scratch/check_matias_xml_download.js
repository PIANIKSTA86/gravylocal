const fs = require('fs');

const content = fs.readFileSync('DatosReferencia/apiMatias/# MATIAS API UBL 2.1.txt', 'utf8');

// Find all headings or endpoint descriptions
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);

// Search for RADIAN / Events section
const radianIdx = lines.findIndex(l => l.includes('Eventos RADIAN') || l.includes('events-radian'));
console.log(`RADIAN reference at line: ${radianIdx}`);

// Search for any endpoint with /events or /download or /documents
const endpoints = new Set();
lines.forEach((l, idx) => {
  const match = l.match(/(?:GET|POST|PUT|DELETE)\s+([\/\{a-zA-Z0-9_\-\.\:\}]+)/i);
  if (match) {
    endpoints.add(match[0].trim());
  }
});

console.log('--- FOUND ENDPOINTS ---');
Array.from(endpoints).filter(e => e.includes('event') || e.includes('doc') || e.includes('xml') || e.includes('down') || e.includes('track') || e.includes('excel') || e.includes('status') || e.includes('file')).forEach(e => console.log(e));
