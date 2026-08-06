const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function testHookLogic() {
  const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  const txId = 'qx1d9gsts97jp4q';

  console.log('--- Step 1: Query transaction ---');
  const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(txId);
  console.log('Transaction:', tx);

  console.log('--- Step 2: Query tx_type ---');
  const txType = db.prepare("SELECT * FROM transaction_types WHERE id = ?").get(tx.tx_type_id);
  console.log('TxType:', txType);

  console.log('--- Step 3: Query third_party ---');
  const customer = db.prepare("SELECT * FROM third_parties WHERE id = ?").get(tx.third_party_id);
  console.log('Customer:', customer);

  console.log('--- Step 4: Check einvoice_docs ---');
  const einvoiceDoc = db.prepare("SELECT * FROM einvoice_docs WHERE tx_id = ?").get(txId);
  console.log('EinvoiceDoc:', einvoiceDoc);

  console.log('--- Step 5: Query invoice ---');
  const invoice = db.prepare("SELECT * FROM invoices WHERE tx_id = ?").get(txId);
  console.log('Invoice:', invoice);

  console.log('--- Step 6: Query invoice_lines ---');
  if (invoice) {
    const lines = db.prepare("SELECT * FROM invoice_lines WHERE invoice_id = ?").all(invoice.id);
    console.log('Invoice Lines:', lines);
    lines.forEach((l, idx) => {
      if (l.product_id) {
        const prod = db.prepare("SELECT * FROM products WHERE id = ?").get(l.product_id);
        console.log(`  Line ${idx+1} Product:`, prod);
      }
    });
  }

  console.log('--- Step 7: Query dian_resolutions ---');
  const txPrefix = txType ? (txType.prefix || '') : '';
  const txTypeCode = txType ? (txType.code || '') : '';
  console.log('txPrefix:', txPrefix, 'txTypeCode:', txTypeCode);
  const resolutions = db.prepare("SELECT * FROM dian_resolutions WHERE active = 1 AND prefix = ? AND document_type = ?").all(txPrefix, txTypeCode);
  console.log('Resolutions:', resolutions);

  console.log('--- Step 8: Query company settings ---');
  const settings = db.prepare("SELECT key, value FROM settings").all();
  const getSetting = (k, fallback) => {
    const s = settings.find(x => x.key === k);
    return (s && s.value) ? s.value : fallback;
  };
  const einvoiceMethod = getSetting("einvoice_method", "dian");
  const ftechUsername = getSetting("ftech_username", "") || getSetting("company_nit", "900123456").split('-')[0].replace(/[^0-9]/g, '');
  const ftechPassword = getSetting("ftech_password", "");
  const ftechEnvironment = getSetting("ftech_environment", "2");

  console.log('einvoiceMethod:', einvoiceMethod);
  console.log('ftechUsername:', ftechUsername);
  console.log('ftechPassword:', ftechPassword ? '[SET]' : '[MISSING/EMPTY]');
  console.log('ftechEnvironment:', ftechEnvironment);

}

testHookLogic();
