const fs = require('fs');

const files = fs.readdirSync('scratch');
for (const f of files) {
  if (f.endsWith('.js') || f.endsWith('.json')) {
    try {
      const c = fs.readFileSync('scratch/' + f, 'utf8');
      if (c.includes('InvoicePeriod') || c.includes('billing_period') || c.includes('invoice_period')) {
        console.log("Found in:", f);
      }
    } catch(e) {}
  }
}

