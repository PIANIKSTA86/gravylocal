const fs = require('fs');

const file = 'frontend/src/modules/reportes.ts';
let content = fs.readFileSync(file, 'utf8');

const normalize = s => s.replace(/\r\n/g, '\n');

// Find renderAgingPortfolio definition
const startMarker = 'async function renderAgingPortfolio() {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Could not find startMarker');
  process.exit(1);
}

// Find where renderAgingPortfolio ends (next function is usually `// --- VITE MIGRATION GLOBALS ---` or `async function renderWithholdingCertificates`)
// Let's check what function is after renderAgingPortfolio
const nextMarker = 'async function renderWithholdingCertificates';
const nextIndex = content.indexOf(nextMarker, startIndex);
if (nextIndex === -1) {
  console.error('Could not find nextMarker');
  process.exit(1);
}

const currentFunc = content.substring(startIndex, nextIndex);
console.log('Found renderAgingPortfolio, length:', currentFunc.length);

// Let's inspect the first 200 chars and last 200 chars of currentFunc
console.log('Start of currentFunc:', currentFunc.substring(0, 150));
console.log('End of currentFunc:', currentFunc.substring(currentFunc.length - 150));

