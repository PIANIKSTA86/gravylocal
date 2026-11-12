const fs = require('fs');
const docs = JSON.parse(fs.readFileSync('scratch/matias_docs.json', 'utf8'));

for (const [name, schema] of Object.entries(docs.components.schemas)) {
  if (schema.properties) {
    for (const prop of Object.keys(schema.properties)) {
      if (/period|start_date|end_date/i.test(prop)) {
        console.log(`Schema "${name}" has property "${prop}"`);
      }
    }
  }
}

