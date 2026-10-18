const fs = require('fs');

const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md`;
const txt = fs.readFileSync(f, 'utf8');

const matches = txt.match(/"discrepancy_response"[\s\S]*?\}/g) || [];
console.log('Matches:', matches.length);
matches.slice(0, 3).forEach(m => console.log(m));
