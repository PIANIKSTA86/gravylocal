const fs = require('fs');
const content = fs.readFileSync('hub/orchestrator.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('restart') || l.includes('api/company') || l.includes('reload') || l.includes('syncHooks')) {
    console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
