const fs = require('fs');
const txt = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md', 'utf8');

const jsonStart = txt.indexOf('{');
const data = JSON.parse(txt.slice(jsonStart));

function search(items) {
  for (const it of items) {
    if (it.item) search(it.item);
    else if (it.request) {
      const name = it.name || '';
      const url = it.request.url?.raw || (typeof it.request.url === 'string' ? it.request.url : it.request.url?.path?.join('/')) || '';
      if (name.toLowerCase().includes('credit') || url.includes('credit')) {
        console.log(`Name: ${name} | URL: ${url}`);
        if (it.request.body?.raw) {
          try {
            const b = JSON.parse(it.request.body.raw);
            console.log(` -> operation_type_id: ${b.operation_type_id}, type_document_id: ${b.type_document_id}`);
          } catch (_) {
            console.log(' -> raw body snippet:', it.request.body.raw.slice(0, 100));
          }
        }
      }
    }
  }
}

search(data.item || []);
