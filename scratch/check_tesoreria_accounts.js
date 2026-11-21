const fs = require('fs');
const content = fs.readFileSync('pb_hooks/tesoreria.pb.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('134595') || l.includes('cross_doc_ref') || l.includes('cxc_account')) {
    console.log(`L${i+1}: ${l}`);
  }
});
