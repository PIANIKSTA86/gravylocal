const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '..', 'pb_public', 'assets', 'main-OrBysoO9.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('Total lines in main-OrBysoO9.js:', lines.length);

if (lines.length >= 9047) {
  console.log('--- Line 9047 ---');
  console.log(lines[9046].slice(0, 300));
} else {
  // If minified onto few lines or thousands of lines
  console.log('Lines count is less than 9047. Finding /api/dian/emit occurrences in bundle...');
  lines.forEach((l, i) => {
    if (l.includes('/api/dian/emit')) {
      console.log(`Line ${i + 1}: ${l.slice(0, 200)}...`);
    }
  });
}
