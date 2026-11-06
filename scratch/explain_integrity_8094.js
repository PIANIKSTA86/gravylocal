const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const invs = db.prepare(`SELECT count(*) as count, SUM(total) as tot FROM ph_invoices WHERE status != 'voided' AND tx_id != ''`).get();
console.log('Facturas (Cabeceras no anuladas con asiento):');
console.log('  Cantidad:', invs.count);
console.log('  Total Facturado:', invs.tot);

const lines = db.prepare(`
  SELECT count(*) as count, SUM(l.amount) as tot
  FROM ph_invoice_lines l
  INNER JOIN ph_invoices i ON i.id = l.invoice_id
  WHERE i.status != 'voided' AND i.tx_id != ''
`).get();
console.log('Líneas de Factura (Cuerpo original de esas 999 facturas):');
console.log('  Cantidad:', lines.count);
console.log('  Total Líneas Originales:', lines.tot);

console.log('Diferencia entre Cabeceras y Líneas Originales:', invs.tot - lines.tot);

