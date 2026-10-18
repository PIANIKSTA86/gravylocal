const fs = require('fs');

const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

function printItemBody(endpointKeyword) {
  const idx = txt.indexOf(endpointKeyword);
  if (idx === -1) return;
  // search backward for "raw":
  const rawIdx = txt.lastIndexOf('"raw":', idx);
  if (rawIdx !== -1) {
    console.log(`\n================ ${endpointKeyword} BODY ================`);
    let rawStr = txt.slice(rawIdx + 6, idx);
    const endRaw = rawStr.lastIndexOf('",');
    if (endRaw !== -1) {
      rawStr = rawStr.slice(0, endRaw);
      try {
        console.log(JSON.parse(`"${rawStr}"`));
      } catch (e) {
        console.log(rawStr.slice(0, 1500));
      }
    } else {
      console.log(rawStr.slice(0, 1500));
    }
  }
}

printItemBody('/notes/credit');
printItemBody('/ds/adjustment-note');
printItemBody('/ep/payroll/replace');
printItemBody('/ep/payroll/delete');
