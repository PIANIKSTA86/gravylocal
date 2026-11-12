const fs = require('fs');
const c = fs.readFileSync('pb_hooks/reports_optimized.pb.js', 'utf8');

const idx = c.indexOf('auxPropertyId');
console.log(c.substring(idx + 1500, idx + 3500));
