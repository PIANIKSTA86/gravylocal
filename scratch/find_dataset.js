const fs = require('fs');
const content = fs.readFileSync('frontend/src/api.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('_getPhCarteraDataset(')) {
    console.log(`L${i+1}: ${l}`);
  }
});
