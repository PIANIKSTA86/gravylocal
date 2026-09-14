const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`
  SELECT 
    m.id, m.date, m.description, m.debit, m.credit, m.reconciled, m.tx_line_id
  FROM bank_movements m 
  WHERE m.bank_account_id = 'qoc9o8krztojvpj' AND (m.tx_line_id = '' OR m.tx_line_id IS NULL)
  ORDER BY m.date ASC
`, (err, movs) => {
  console.log('Unmatched movs count:', movs.length);
  
  // Categorize unmatched movs
  const categories = {};
  for (const m of movs) {
    let cat = 'OTHER';
    const d = m.description.toUpperCase();
    if (d.includes('4X1000') || d.includes('GMF') || d.includes('GRAVAMEN')) cat = '4X1000';
    else if (d.includes('COMISION') || d.includes('CUOTA') || d.includes('MANEJO')) cat = 'COMISION_MANEJO';
    else if (d.includes('IVA')) cat = 'IVA_BANCARIO';
    else if (d.includes('INTERES') || d.includes('RENDIMIENTO')) cat = 'INTERESES';
    else if (d.includes('TRANSFERENCIA') || d.includes('NEQUI') || d.includes('PSE') || d.includes('PAGO') || d.includes('CONSIG')) cat = 'TRANSFERENCIA_PAGO_CONSIG';
    
    categories[cat] = (categories[cat] || 0) + 1;
  }
  console.log('Categories of unmatched movs:', categories);

  // Print all in TRANSFERENCIA_PAGO_CONSIG or OTHER
  console.log('\nDetailed non-fee unmatched movs:');
  movs.filter(m => {
    const d = m.description.toUpperCase();
    return !d.includes('4X1000') && !d.includes('IVA') && !d.includes('MANEJO') && !d.includes('INTERES');
  }).forEach(m => {
    console.log(`[${m.date}] debit=${m.debit} credit=${m.credit} desc="${m.description}" reconciled=${m.reconciled}`);
  });
});
