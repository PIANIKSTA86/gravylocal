const fs = require('fs');

function searchPatterns(dir, patterns) {
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    if (f.endsWith('.ts') || f.endsWith('.js')) {
      const full = dir + '/' + f;
      try {
        const c = fs.readFileSync(full, 'utf8');
        for (const p of patterns) {
          if (c.includes(p)) {
            console.log(`Found "${p}" in ${full}`);
          }
        }
      } catch (e) {}
    }
  }
}

searchPatterns('frontend/src', ['generatePhInvoicePdf', 'downloadInvoicePdf', 'printPhInvoice', 'exportPhInvoicePdf']);
searchPatterns('pb_hooks', ['ph_invoice', 'generate_invoice', 'billing']);
