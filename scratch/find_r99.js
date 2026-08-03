const fs = require('fs');

const content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('R-99-PJ') || line.includes('R-99-PN')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
