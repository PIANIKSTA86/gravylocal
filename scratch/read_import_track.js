const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\13\\content.md', 'utf8');

const idx = content.indexOf('import-track-id');
console.log(content.slice(idx - 50, idx + 1200).replace(/<[^>]+>/g, ' '));
