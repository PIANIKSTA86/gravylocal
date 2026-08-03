const fs = require('fs');

const content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.toUpperCase().includes('COLOMBIA')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
