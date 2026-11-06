const fs = require('fs');

function searchAllFiles(dir, query) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const full = dir + '/' + f;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') res = res.concat(searchAllFiles(full, query));
    } else if (f.endsWith('.js') || f.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes(query)) res.push(full);
    }
  });
  return res;
}

console.log('Files with /api/dian/nomina/emit:', searchAllFiles('.', '/api/dian/nomina/emit'));
console.log('Files with /api/dian/nomina/check-status:', searchAllFiles('.', '/api/dian/nomina/check-status'));

