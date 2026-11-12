const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Property
  db.all(`SELECT id, code, name, owner_id FROM ph_properties WHERE code = '4104'`, (err, props) => {
    console.log('Property 4104:', props);
    const propId = props[0].id;

    // 2. Invoices
    db.all(`
      SELECT id, number, period, date, total, subtotal, status, tx_id
      FROM ph_invoices
      WHERE property_id = ?
      ORDER BY period ASC
    `, [propId], (err, invs) => {
      console.log('Invoices for 4104:');
      console.table(invs);

      // 3. Transactions linked to invoices
      const txIds = invs.map(i => i.tx_id).filter(Boolean);
      db.all(`
        SELECT id, number, date, status, description
        FROM transactions
        WHERE id IN (${txIds.map(x => `'${x}'`).join(',')})
      `, (err, txs) => {
        console.log('Causation Transactions for 4104:');
        console.table(txs);
      });
    });

    // 4. All tx_lines touching 13459501 for 4104
    db.all(`
      SELECT l.id, t.number as tx_num, t.date, t.status as tx_status, l.debit, l.credit, l.description, l.cross_doc_ref
      FROM tx_lines l
      JOIN transactions t ON t.id = l.tx_id
      JOIN accounts a ON a.id = l.account_id
      WHERE a.code = '13459501' AND (
        l.description LIKE '%4104%' OR l.description LIKE '%D-104%' OR
        l.cross_doc_ref LIKE '%4104%' OR l.cross_doc_ref IN (
          SELECT number FROM ph_invoices WHERE property_id = ?
        ) OR t.number = 'RC-00000497'
      )
      ORDER BY t.date ASC, t.number ASC
    `, [propId], (err, lines) => {
      console.log('All 13459501 lines for 4104:');
      console.table(lines);
      let deb = 0, cred = 0;
      for (const l of lines) {
        deb += Number(l.debit || 0);
        cred += Number(l.credit || 0);
      }
      console.log(`SUM 13459501 for 4104: Debits=${deb}, Credits=${cred}, Net Balance=${deb - cred}`);
    });

    // 5. Inspect RC-00000497 in full
    db.all(`
      SELECT t.id, t.number, t.date, t.status, t.description as tx_desc, t.teso_mode, t.teso_params
      FROM transactions t
      WHERE t.number = 'RC-00000497'
    `, (err, rc) => {
      console.log('Transaction RC-00000497 header:', rc);
      db.all(`
        SELECT l.id, a.code as acc_code, a.name as acc_name, l.debit, l.credit, l.description, l.cross_doc_ref
        FROM tx_lines l
        JOIN accounts a ON a.id = l.account_id
        WHERE l.tx_id = ?
      `, [rc[0].id], (err, rclines) => {
        console.log('Lines of RC-00000497:');
        console.table(rclines);
      });
    });
  });
});

