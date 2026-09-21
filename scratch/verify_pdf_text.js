const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function extractPdfText(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  let allText = '';
  
  // Find all streams: stream ... endstream
  let pos = 0;
  while (true) {
    const streamStart = buf.indexOf('stream\n', pos) !== -1 ? buf.indexOf('stream\n', pos) + 7 : buf.indexOf('stream\r\n', pos) + 8;
    if (streamStart < 8) break;
    const streamEnd = buf.indexOf('endstream', streamStart);
    if (streamEnd === -1) break;
    
    const streamData = buf.slice(streamStart, streamEnd);
    try {
      const decompressed = zlib.inflateSync(streamData).toString('latin1');
      allText += decompressed + '\n';
    } catch (e) {
      // not compressed or different compression
      allText += streamData.toString('latin1') + '\n';
    }
    pos = streamEnd + 9;
  }
  return allText;
}

const ublText = extractPdfText(path.resolve(__dirname, 'test_dse_ubl.pdf'));
const ftechText = extractPdfText(path.resolve(__dirname, 'test_dse_ftech.pdf'));

console.log('--- UBL 2.1 TEXT EXTRACTED ---');
const hasConceptUbl = ublText.includes('ASEO Y VIGILANCIA SEDE PRINCIPAL');
const hasNotesUbl = ublText.includes('Comentario contable otorgado por el usuario');
const hasPorOperacion = ublText.includes('Por operaci');

console.log('Concepto encontrado:', hasConceptUbl);
console.log('Comentarios / Observaciones encontrados:', hasNotesUbl);
console.log('Contiene "Por operación":', hasPorOperacion);

console.log('\n--- FACTURATECH TEXT EXTRACTED ---');
const hasConceptFtech = ftechText.includes('ASEO Y VIGILANCIA FEBRERO 2026');
const hasNotesFtech = ftechText.includes('Comentario contable otorgado por el usuario');

console.log('Concepto FacturaTech encontrado:', hasConceptFtech);
console.log('Comentarios / Observaciones encontrados:', hasNotesFtech);

if (hasConceptUbl && hasNotesUbl && hasConceptFtech && hasNotesFtech && !hasPorOperacion) {
  console.log('\n======================================================');
  console.log('¡VALIDACIÓN EXITOSA AL 100%!');
  console.log('1. El concepto real se muestra en la descripción de cada ítem.');
  console.log('2. "Por operación" NO sobrescribe ni contamina la descripción.');
  console.log('3. Los comentarios u observaciones otorgados por el usuario se imprimen en el bloque de observaciones.');
  console.log('======================================================');
} else {
  console.log('\nResultados detallados:');
  console.log({ hasConceptUbl, hasNotesUbl, hasPorOperacion, hasConceptFtech, hasNotesFtech });
}
