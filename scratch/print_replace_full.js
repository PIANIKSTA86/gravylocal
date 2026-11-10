const fs = require('fs');
const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

const idx = txt.indexOf('/ep/payroll/replace');
console.log('Index:', idx);
if (idx !== -1) {
  // Find "body":
  const bodyIdx = txt.lastIndexOf('"body":', idx);
  console.log('--- Body snippet ---');
  console.log(txt.slice(bodyIdx, idx + 100));
}
