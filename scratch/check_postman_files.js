const fs = require('fs');

const files = fs.readdirSync('scratch').filter(f => f.includes('postman') || f.includes('matias'));
console.log("Files:", files);

for (const f of files) {
  if (f.endsWith('.json')) {
    try {
      const content = fs.readFileSync('scratch/' + f, 'utf8');
      if (content.includes('credit') || content.includes('discrepancy')) {
        console.log(`File ${f} contains credit/discrepancy`);
      }
    } catch(e) {}
  }
}

