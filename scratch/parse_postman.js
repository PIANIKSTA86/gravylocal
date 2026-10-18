const fs = require('fs');

const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

const jsonStart = txt.indexOf('{');
const data = JSON.parse(txt.slice(jsonStart));

function findRequests(items) {
  for (const item of items) {
    if (item.item) {
      findRequests(item.item);
    } else if (item.request) {
      const url = item.request.url?.raw || (typeof item.request.url === 'string' ? item.request.url : item.request.url?.path?.join('/')) || '';
      const method = item.request.method || 'GET';
      const name = item.name || '';
      if (url.includes('notes') || url.includes('/ds') || url.includes('/ep') || url.includes('events') || url.includes('invoice')) {
        console.log(`\n>>> [${method}] "${name}" -> ${url}`);
        if (item.request.body && item.request.body.raw) {
          try {
            const parsedBody = JSON.parse(item.request.body.raw);
            console.log('  Keys:', Object.keys(parsedBody));
            if (parsedBody.billing_reference) console.log('  billing_reference:', parsedBody.billing_reference);
            if (parsedBody.discrepancy_response) console.log('  discrepancy_response:', parsedBody.discrepancy_response);
            if (parsedBody.preceding_payroll) console.log('  preceding_payroll:', parsedBody.preceding_payroll);
          } catch (_) {
            console.log('  Raw snippet:', item.request.body.raw.slice(0, 200).replace(/\r?\n/g, ' '));
          }
        }
      }
    }
  }
}

findRequests(data.item || []);
