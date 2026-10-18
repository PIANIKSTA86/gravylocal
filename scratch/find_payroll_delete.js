const fs = require('fs');

const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

const jsonStart = txt.indexOf('{');
const data = JSON.parse(txt.slice(jsonStart));

function findDelete(items) {
  for (const item of items) {
    if (item.item) findDelete(item.item);
    else if (item.request) {
      const url = item.request.url?.raw || '';
      if (url.includes('delete') && url.includes('payroll')) {
        console.log('--- FOUND PAYROLL DELETE ---');
        console.log(item.request.body?.raw);
      }
    }
  }
}

findDelete(data.item || []);
