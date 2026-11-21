const fs = require('fs');
const files = fs.readdirSync('pb_hooks');
for (const f of files) {
  if (f.endsWith('.js')) {
    const full = 'pb_hooks/' + f;
    const c = fs.readFileSync(full, 'utf8');
    if (c.includes('integrity-check')) {
      console.log(`Found in ${full}`);
    }
  }
}
