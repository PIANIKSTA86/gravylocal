const fs = require('fs');
const txt = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md', 'utf8');

const jsonStart = txt.indexOf('{');
const data = JSON.parse(txt.slice(jsonStart));

function searchEvents(items) {
  for (const it of items) {
    if (it.item) searchEvents(it.item);
    else if (it.request) {
      const url = it.request.url?.raw || '';
      if (url.includes('events') || url.includes('people') || url.includes('reception')) {
        console.log(`[${it.request.method}] ${it.name} -> ${url}`);
        if (it.request.body?.raw) {
          console.log('   Body:', it.request.body.raw.slice(0, 150));
        }
      }
    }
  }
}

searchEvents(data.item || []);
