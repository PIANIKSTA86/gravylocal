const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Actualizar NOM-366 a ANULADO formalmente
db.prepare(`
  UPDATE electronic_payrolls 
  SET estado_dian = 'ANULADO',
      dian_response = 'Anulado formalmente ante la DIAN mediante Nota de Ajuste de Eliminación NANE-4'
  WHERE id = '8rmt1iurq72m1m0'
`).run();

console.log('NOM-366 actualizado a ANULADO en pb_data/data.db');
const nom366 = db.prepare('SELECT id, prefijo, consecutivo, estado_dian, dian_response FROM electronic_payrolls WHERE id = ?').get('8rmt1iurq72m1m0');
console.log('NOM-366:', nom366);

