const fs = require('fs');

function searchFolder(dir, query) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = dir + '/' + f;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        results = results.concat(searchFolder(full, query));
      }
    } else if (f.endsWith('.ts') || f.endsWith('.js')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.toLowerCase().includes(query.toLowerCase())) {
        results.push({ file: full, occurrences: (c.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length });
      }
    }
  }
  return results;
}

console.log('Searching "NominaIndividualDeAjuste":', searchFolder('.', 'NominaIndividualDeAjuste'));
console.log('Searching "ajuste" in frontend/src/modules/documentos-electronicos.ts:', searchFolder('frontend/src/modules', 'ajuste'));
console.log('Searching "NANE":', searchFolder('.', 'NANE'));

