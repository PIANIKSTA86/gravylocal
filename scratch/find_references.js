const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('scratch');
for (const file of files) {
  if (file.endsWith('.json') || file.endsWith('.js')) {
    try {
      const content = fs.readFileSync(path.join('scratch', file), 'utf8');
      if (content.includes('billing_reference') || content.includes('discrepancy_response') || content.includes('/notes/credit')) {
        console.log('Match in file:', file);
      }
    } catch(e) {}
  }
}

