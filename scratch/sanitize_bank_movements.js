/**
 * Saneamiento de movimientos bancarios huérfanos y corrección de integridad
 * GRAVY v2.0
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.serialize(() => {
  console.log('=== INICIANDO SANEAMIENTO DE MOVIMIENTOS BANCARIOS ===');

  // 1. Identificar cuántos movimientos tienen reconciled = 1 pero tx_line_id = ''
  db.get(`
    SELECT count(*) as count 
    FROM bank_movements 
    WHERE reconciled = 1 AND (tx_line_id = '' OR tx_line_id IS NULL)
  `, (err, row) => {
    if (err) return console.error('Error identificando huérfanos:', err);
    console.log(`Movimientos con reconciled=1 y sin tx_line_id encontrados: ${row.count}`);
  });

  // 2. Emparejar específicamente los movimientos que tienen comprobante contable idéntico en fecha y monto
  // Caso 1: PAGO A PROVE nemesis transpo (2026-07-29, 2310000) -> CG-00000584
  db.run(`
    UPDATE bank_movements 
    SET tx_line_id = (
      SELECT tl.id 
      FROM tx_lines tl 
      JOIN transactions t ON tl.tx_id = t.id 
      WHERE t.number = 'CG-00000584' AND tl.account_id = 'f6s9lpt10605ma3' AND tl.credit = 2310000 
      LIMIT 1
    )
    WHERE id = 'w6orhcnctbegpfw' AND (tx_line_id = '' OR tx_line_id IS NULL)
  `, function(err) {
    if (err) console.error('Error emparejando CG-00000584:', err);
    else console.log(`Movimiento w6orhcnctbegpfw (nemesis transpo) emparejado con CG-00000584: ${this.changes} cambios`);
  });

  // Caso 2: CONSIG LOCAL EFECTIVO (2026-07-31, 1811500) -> RC-00000641
  db.run(`
    UPDATE bank_movements 
    SET tx_line_id = (
      SELECT tl.id 
      FROM tx_lines tl 
      JOIN transactions t ON tl.tx_id = t.id 
      WHERE t.number = 'RC-00000641' AND tl.account_id = 'f6s9lpt10605ma3' AND tl.debit = 1811500 
      LIMIT 1
    )
    WHERE id = '98r22mywtyz9o8c' AND (tx_line_id = '' OR tx_line_id IS NULL)
  `, function(err) {
    if (err) console.error('Error emparejando RC-00000641:', err);
    else console.log(`Movimiento 98r22mywtyz9o8c (CONSIG LOCAL) emparejado con RC-00000641: ${this.changes} cambios`);
  });

  // Caso 3: PAGO OPERACI¢N MON EXTRANJERA (2026-07-31, 27127) -> CG-00000592
  db.run(`
    UPDATE bank_movements 
    SET tx_line_id = (
      SELECT tl.id 
      FROM tx_lines tl 
      JOIN transactions t ON tl.tx_id = t.id 
      WHERE t.number = 'CG-00000592' AND tl.account_id = 'f6s9lpt10605ma3' AND tl.credit = 27127 
      LIMIT 1
    )
    WHERE id = 'ljvcrwq4wvcksyr' AND (tx_line_id = '' OR tx_line_id IS NULL)
  `, function(err) {
    if (err) console.error('Error emparejando CG-00000592:', err);
    else console.log(`Movimiento ljvcrwq4wvcksyr (MON EXTRANJERA) emparejado con CG-00000592: ${this.changes} cambios`);
  });

  // 3. Resetear todos los demás movimientos huérfanos que NO tienen tx_line_id a reconciled = 0
  // para que queden disponibles para sugerencias y cruces automáticos o generación de notas de ajuste
  db.run(`
    UPDATE bank_movements 
    SET reconciled = 0 
    WHERE (tx_line_id = '' OR tx_line_id IS NULL) AND reconciled = 1
  `, function(err) {
    if (err) console.error('Error reseteando huérfanos a reconciled=0:', err);
    else console.log(`Movimientos huérfanos reseteados a reconciled = 0 (pendientes legítimos): ${this.changes}`);
  });

  // 4. Estadísticas finales
  db.all(`
    SELECT 
      count(*) as total,
      sum(case when reconciled = 1 and tx_line_id != '' then 1 else 0 end) as concilidados_con_asiento,
      sum(case when reconciled = 0 then 1 else 0 end) as pendientes_legitimos,
      sum(case when reconciled = 1 and (tx_line_id = '' or tx_line_id is null) then 1 else 0 end) as huerfanos_restantes
    FROM bank_movements
  `, (err, stats) => {
    if (err) console.error('Error consultando estadísticas:', err);
    else console.log('Estadísticas finales tras saneamiento:', stats);
    db.close();
  });
});
