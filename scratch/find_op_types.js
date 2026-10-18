const fs = require('fs');
const txt = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md', 'utf8');

const m = txt.match(/operation_type_id[^\d]+(\d+)/g) || [];
console.log('Matches:', [...new Set(m)].slice(0, 20));
