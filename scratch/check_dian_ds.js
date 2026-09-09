const fs = require('fs');
const content = fs.readFileSync('./pb_hooks/dian.pb.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("purchase_invoices") || l.includes("'DS'") || l.includes('"DS"') || l.includes("DSE") || l.includes("Documento Soporte")) {
    console.log((i+1) + ': ' + l.trim());
  }
});
