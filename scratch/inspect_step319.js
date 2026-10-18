const fs = require('fs');

const f = 'C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\319\\content.md';
if (fs.existsSync(f)) {
  const txt = fs.readFileSync(f, 'utf8');
  const pos = txt.indexOf('IDs del API vs');
  if (pos !== -1) {
    console.log(txt.slice(pos, pos + 2500).replace(/<[^>]+>/g, ' '));
  }
}
