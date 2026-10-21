const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\21\\content.md', 'utf8');

const target = '"path":["invoice"]';
const idx = content.indexOf(target);
if (idx !== -1) {
  // Find "raw": "{...}" around this index
  const start = content.lastIndexOf('"raw":', idx);
  const end = content.indexOf('"url":', idx);
  console.log('Raw section:');
  console.log(content.slice(start, Math.min(start + 1500, end)));
}
