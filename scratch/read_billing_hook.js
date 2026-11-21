const fs = require('fs');
const content = fs.readFileSync('pb_hooks/ph_billing.pb.js', 'utf8');
const lines = content.split('\n');
console.log('Lines in ph_billing.pb.js:', lines.length);
lines.slice(0, 50).forEach((l, i) => console.log(`L${i+1}: ${l}`));
