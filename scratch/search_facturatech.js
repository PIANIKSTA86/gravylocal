const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\pb_hooks\\dian.pb.js', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('facturatech') || l.includes('ftech')) {
    console.log(`Line ${idx + 1}: ${l.trim().slice(0, 100)}`);
  }
});
