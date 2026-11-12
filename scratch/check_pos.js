const fs = require('fs');
const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));

const posPaths = Object.keys(docs.paths).filter(p => p.toLowerCase().includes('pos'));
console.log("POS paths in MATIAS API:", posPaths);

for (const p of posPaths) {
  console.log(p, Object.keys(docs.paths[p]));
  if (docs.paths[p].post) {
    console.log("  POST summary:", docs.paths[p].post.summary);
  }
}

