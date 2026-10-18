const fs = require('fs');

const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

const idx = txt.indexOf('ep/payroll/replace');
const rawIdx = txt.lastIndexOf('"raw":', idx);
const slice = txt.slice(rawIdx, idx);
console.log(slice);
