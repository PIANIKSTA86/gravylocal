const fs = require('fs');
const path = 'C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md';
if (fs.existsSync(path)) {
  const content = fs.readFileSync(path, 'utf8');
  const custMatches = content.match(/"customer":\s*\{[^}]+\}/g);
  if (custMatches) {
    console.log('Customer samples (first 3):');
    custMatches.slice(0, 3).forEach(c => console.log(c, '\n---'));
  } else {
    console.log('No direct customer matches');
  }
}
