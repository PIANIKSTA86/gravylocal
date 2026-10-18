const fs = require('fs');
const txt = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md', 'utf8');

const jsonStart = txt.indexOf('{');
const data = JSON.parse(txt.slice(jsonStart));

function search(items) {
  for (const it of items) {
    if (it.item) search(it.item);
    else if (it.request) {
      const url = it.request.url?.raw || '';
      if (url.includes('credit') || url.includes('debit') || url.includes('adjustment-note')) {
        console.log(`Endpoint: ${url}`);
        if (it.request.body?.raw) {
          try {
            const b = JSON.parse(it.request.body.raw);
            console.log(` -> operation_type_id: ${b.operation_type_id}, type_document_id: ${b.type_document_id}`);
          } catch (_) {}
        }
      }
    }
  }
}

search(data.item || []);
