const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening db:', err.message);
    process.exit(1);
  }
});

const sampleCodes = ['1104', '1201', '1403', '3503', '4104', '1402', '1401', '2301'];

db.serialize(() => {
  db.all(`SELECT id, code, name FROM ph_properties WHERE code IN ('${sampleCodes.join("','")}')`, (err, props) => {
    if (err) return console.error(err);

    props.forEach(p => {
      db.all(`SELECT id, number, period, date, total, status, tx_id FROM ph_invoices WHERE property_id = ?`, [p.id], (err, invs) => {
        let totFact = 0;
        invs.forEach(i => { if (i.status !== 'voided' && i.tx_id) totFact += Number(i.total || 0); });
        console.log(`\n========================================`);
        console.log(`Unidad ${p.code} (${p.name}) - ID: ${p.id}`);
        console.log(`Invoices count: ${invs.length}, Facturado activo: ${totFact}`);
        invs.forEach(i => {
          console.log(`  Inv ${i.number} | Per: ${i.period} | Tot: ${i.total} | Stat: ${i.status} | tx_id: ${i.tx_id}`);
        });

        // Check tx_lines for this property
        db.all(`
          SELECT l.id, l.tx_id, l.debit, l.credit, l.cross_doc_ref, l.description, t.number as tx_number, t.date as tx_date, a.code as acc_code
          FROM tx_lines l
          JOIN transactions t ON t.id = l.tx_id
          JOIN accounts a ON a.id = l.account_id
          WHERE a.code LIKE '134595%'
            AND (l.cross_doc_ref LIKE ? OR l.cross_doc_ref LIKE ? OR l.description LIKE ? OR l.description LIKE ?)
        `, [`%${p.code}%`, `%${p.id}%`, `%${p.code}%`, `%${p.name}%`], (err, lines) => {
          let debits = 0, credits = 0;
          console.log(`Tx lines for ${p.code}: ${lines.length}`);
          lines.forEach(l => {
            debits += Number(l.debit || 0);
            credits += Number(l.credit || 0);
            console.log(`  Line tx: ${l.tx_number} (${l.tx_date}) | D: ${l.debit} | C: ${l.credit} | ref: ${l.cross_doc_ref} | desc: ${l.description}`);
          });
          console.log(`  SUM Debits: ${debits}, SUM Credits: ${credits}, Net: ${debits - credits}`);
        });
      });
    });
  });
});
