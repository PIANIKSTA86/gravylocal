const fs = require('fs');

function findBillingRef() {
  const steps = ['315', '319', '446', '17', '21'];
  for (const s of steps) {
    const f = `C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\${s}\\content.md`;
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    const idx = txt.indexOf('billing_reference');
    if (idx !== -1) {
      console.log(`\n=== STEP ${s} billing_reference: ===`);
      console.log(txt.slice(idx - 100, idx + 800).replace(/<[^>]+>/g, ' '));
    }
  }
}

findBillingRef();
