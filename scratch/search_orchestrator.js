const fs = require('fs');
const content = fs.readFileSync('hub/orchestrator.js', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('sqlite') || line.includes('Database') || line.includes('companyDbCache') || line.includes('resolveDbPath')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
