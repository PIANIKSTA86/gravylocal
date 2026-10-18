const fs = require('fs');
const path = require('path');

function extractDetails(step, keywords) {
  const filePath = path.join('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps', step, 'content.md');
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  // Find occurrences of methods like POST, endpoints, and code blocks
  console.log(`\n================ STEP ${step} ================`);
  const lines = content.split('\n');
  let inCode = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('```') || line.includes('<pre') || line.includes('prism-code')) {
      inCode = !inCode;
      if (!inCode && codeBuffer.length > 0) {
        const fullSnippet = codeBuffer.join('\n');
        for (const kw of keywords) {
          if (fullSnippet.toLowerCase().includes(kw.toLowerCase())) {
            console.log(`--- Snippet matching "${kw}": ---`);
            console.log(fullSnippet.slice(0, 1500));
            console.log('---------------------------------');
            break;
          }
        }
        codeBuffer = [];
      }
    } else if (inCode) {
      codeBuffer.push(line);
    }
  }
}

extractDetails('315', ['/invoice', '/notes', 'post', 'endpoint']);
extractDetails('446', ['/ds/', 'adjustment', 'document']);
extractDetails('442', ['/ep/', 'payroll', 'replace', 'delete']);
