const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function getFullPdfText(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const str = buf.toString('latin1');
  const streamMatch = str.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/);
  const sStart = streamMatch[0].indexOf('stream') + 6;
  const sEnd = streamMatch[0].lastIndexOf('endstream');
  let raw = streamMatch[0].slice(sStart, sEnd).replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, '');
  const inflated = zlib.inflateSync(Buffer.from(raw, 'latin1')).toString('utf-8');

  let full = '';
  const hexMatches = inflated.match(/<([0-9a-fA-F]+)>/g) || [];
  for (const h of hexMatches) {
    const cleanHex = h.slice(1, -1);
    full += Buffer.from(cleanHex, 'hex').toString('latin1');
  }
  return full;
}

const ublFull = getFullPdfText(path.resolve(__dirname, 'test_dse_ubl.pdf'));
const ftechFull = getFullPdfText(path.resolve(__dirname, 'test_dse_ftech.pdf'));

console.log('=== UBL FULL TEXT VALIDATION ===');
console.log('Concepto "ASEO Y VIGILANCIA SEDE PRINCIPAL":', ublFull.includes('ASEO Y VIGILANCIA SEDE PRINCIPAL'));
console.log('Comentario/Observación "Comentario contable otorgado por el usuario":', ublFull.includes('Comentario contable otorgado por el usuario'));
console.log('¿Contiene "Por operación" como concepto?', ublFull.includes('Por operación') || ublFull.includes('Por operaci'));

console.log('\n=== FACTURATECH FULL TEXT VALIDATION ===');
console.log('Concepto "ASEO Y VIGILANCIA FEBRERO 2026":', ftechFull.includes('ASEO Y VIGILANCIA FEBRERO 2026'));
console.log('Comentario/Observación "Comentario contable otorgado por el usuario":', ftechFull.includes('Comentario contable otorgado por el usuario'));

console.log('\nExtracción de fragmento de tabla de ítems:');
const ublTableMatch = ublFull.match(/DESCRIPCI.*?TOTAL/s);
console.log('Cabecera:', ublTableMatch ? ublTableMatch[0] : 'N/A');
const posItem = ublFull.indexOf('ASEO Y VIGILANCIA');
if (posItem !== -1) {
  console.log('Ítem en PDF:', ublFull.slice(posItem - 20, posItem + 80));
}
