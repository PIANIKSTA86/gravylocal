const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function decodePdfHexStrings(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const str = buf.toString('latin1');
  const streamMatch = str.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/);
  if (!streamMatch) return '';
  const sStart = streamMatch[0].indexOf('stream') + 6;
  const sEnd = streamMatch[0].lastIndexOf('endstream');
  let raw = streamMatch[0].slice(sStart, sEnd).replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, '');
  const inflated = zlib.inflateSync(Buffer.from(raw, 'latin1')).toString('utf-8');
  
  // Find all <hex> in TJ or Tj
  let decodedText = '';
  const hexMatches = inflated.match(/<([0-9a-fA-F]+)>/g) || [];
  for (const h of hexMatches) {
    const cleanHex = h.slice(1, -1);
    decodedText += Buffer.from(cleanHex, 'hex').toString('latin1') + ' ';
  }
  return decodedText;
}

const ublDecoded = decodePdfHexStrings(path.resolve(__dirname, 'test_dse_ubl.pdf'));
const ftechDecoded = decodePdfHexStrings(path.resolve(__dirname, 'test_dse_ftech.pdf'));

console.log('=== UBL 2.1 DECODED TEXT ===');
console.log('Tiene ASEO Y VIGILANCIA SEDE PRINCIPAL:', ublDecoded.includes('ASEO Y VIGILANCIA SEDE PRINCIPAL'));
console.log('Tiene Comentario contable otorgado por el usuario:', ublDecoded.includes('Comentario contable otorgado por el usuario'));
console.log('Tiene Por operación en descripción:', ublDecoded.includes('Por operación') || ublDecoded.includes('Por operaci'));

console.log('\n=== FACTURATECH DECODED TEXT ===');
console.log('Tiene ASEO Y VIGILANCIA FEBRERO 2026:', ftechDecoded.includes('ASEO Y VIGILANCIA FEBRERO 2026'));
console.log('Tiene Comentario contable otorgado por el usuario:', ftechDecoded.includes('Comentario contable otorgado por el usuario'));

console.log('\nFragmento del texto de ítems UBL:');
const linesIdx = ublDecoded.indexOf('ASEO Y VIGILANCIA');
if (linesIdx !== -1) {
  console.log(ublDecoded.slice(linesIdx - 50, linesIdx + 150));
}

console.log('\nFragmento del texto de observaciones:');
const obsIdx = ublDecoded.indexOf('OBSERVACIONES');
if (obsIdx !== -1) {
  console.log(ublDecoded.slice(obsIdx, obsIdx + 200));
}
