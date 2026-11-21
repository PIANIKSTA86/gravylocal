const fs = require('fs');
const content = fs.readFileSync('pb_hooks/ph_billing.pb.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('134595') || l.includes('cxc_account_id') || l.includes('post-period') || l.includes('tx_lines')) {
    console.log(`L${i+1}: ${l}`);
  }
});
