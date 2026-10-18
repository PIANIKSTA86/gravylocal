const fs = require('fs');

const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

// Find occurrences of notes/credit or ds/adjustment-note
const idxCredit = txt.indexOf('notes/credit');
if (idxCredit !== -1) {
  console.log('--- notes/credit snippet ---');
  console.log(txt.slice(idxCredit - 200, idxCredit + 1500));
}

const idxDsAdj = txt.indexOf('ds/adjustment-note');
if (idxDsAdj !== -1) {
  console.log('--- ds/adjustment-note snippet ---');
  console.log(txt.slice(idxDsAdj - 200, idxDsAdj + 1500));
}

const idxEpReplace = txt.indexOf('ep/payroll/replace');
if (idxEpReplace !== -1) {
  console.log('--- ep/payroll/replace snippet ---');
  console.log(txt.slice(idxEpReplace - 200, idxEpReplace + 1500));
}
