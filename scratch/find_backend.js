const fs = require('fs');

function searchPattern(dir, pattern) {
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    if (f.endsWith('.ts') || f.endsWith('.js')) {
      const full = dir + '/' + f;
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes(pattern)) {
          console.log(`Found "${pattern}" in ${full}`);
        }
      } catch (e) {}
    }
  }
}

searchPattern('frontend/src', 'getPhCarteraBundle');
searchPattern('pb_hooks', 'getPhCarteraBundle');
searchPattern('pb_hooks', 'report-ph-cartera');
searchPattern('pb_hooks', 'cartera-bundle');
