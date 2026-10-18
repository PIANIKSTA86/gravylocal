const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\13\\content.md', 'utf8');

const regex = /(persona[^\.\n]+|recepci[^\.\n]+)/gi;
const matches = content.match(regex) || [];
console.log('Matches in Step 13:', [...new Set(matches.map(m => m.trim()))].slice(0, 20));
