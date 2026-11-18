const fs = require('fs');
const content = fs.readFileSync('DatosReferencia/apiMatias/# MATIAS API UBL 2.1.txt', 'utf8');

// Search for mentions of Excel and XML together
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.toLowerCase().includes('excel') && (l.toLowerCase().includes('xml') || l.toLowerCase().includes('adjunto') || l.toLowerCase().includes('descarga') || l.toLowerCase().includes('archivo'))) {
    console.log(`Line ${idx}: ${l}`);
  }
});
