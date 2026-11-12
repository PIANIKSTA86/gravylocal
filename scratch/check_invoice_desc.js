const fs = require('fs');
const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));

console.log("Invoice endpoint:", docs.paths['/api/ubl2.1/invoice'].post.description || docs.paths['/api/ubl2.1/invoice'].post.summary);

