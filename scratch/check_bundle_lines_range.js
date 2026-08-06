const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '..', 'pb_public', 'assets', 'main-OrBysoO9.js');
const lines = fs.readFileSync(bundlePath, 'utf8').split('\n');

for (let i = 9035; i <= 9060; i++) {
  console.log(`Line ${i}: ${lines[i - 1]}`);
}
