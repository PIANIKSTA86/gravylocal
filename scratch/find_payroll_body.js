const fs = require('fs');
const f = 'C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md';
const txt = fs.readFileSync(f, 'utf8');

let pos = 0;
while (true) {
  const idx = txt.indexOf('/ep/payroll"', pos);
  if (idx === -1) break;
  console.log('Found /ep/payroll at index:', idx);
  const reqIdx = txt.lastIndexOf('"request":', idx);
  const bodyIdx = txt.indexOf('"raw":', reqIdx);
  if (bodyIdx !== -1 && bodyIdx < idx + 500) {
    console.log('--- BODY SNIPPET ---');
    console.log(txt.slice(bodyIdx + 6, bodyIdx + 4000));
  }
  pos = idx + 20;
}
