const fs = require('fs');
const content = fs.readFileSync('hub/orchestrator.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('8091') || l.includes('startTenant') || l.includes('spawn') || l.includes('startCompany')) {
    console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
