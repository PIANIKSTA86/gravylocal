const fs = require('fs');
const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

const idxDel = txt.indexOf('payroll delete');
if (idxDel !== -1) {
  console.log('--- payroll delete snippet ---');
  console.log(txt.slice(idxDel, idxDel + 1500));
}

