const fs = require('fs');
const content = fs.readFileSync('pb_hooks/reports_optimized.pb.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('report-ph-cartera') || (i > 100 && i < 300 && l.includes('cartera'))) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
