const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'empresas', 'empresa_8091', 'pb_data', 'data.db');
    console.log("Reading DB at:", dbPath);
    const db = new DatabaseSync(dbPath);

    // Get settings
    const settings = db.prepare("SELECT * FROM settings WHERE key LIKE '%dian%' OR key LIKE '%einvoice%' OR key LIKE '%company%'").all();
    console.log("\n=== RELEVANT SETTINGS ===");
    for (const row of settings) {
      console.log(`  ${row.key}: ${row.value}`);
    }

    // Get resolutions
    const resolutions = db.prepare("SELECT * FROM dian_resolutions").all();
    console.log("\n=== DIAN RESOLUTIONS ===");
    for (const row of resolutions) {
      console.log(`  ID: ${row.id}, Prefix: ${row.prefix}, Active: ${row.active}, DocumentType: ${row.document_type}, Current: ${row.current_number}, RegisterId: '${row.pos_register_id}'`);
    }

    // Get POS registers
    try {
      const registers = db.prepare("SELECT * FROM pos_registers").all();
      console.log("\n=== POS REGISTERS ===");
      for (const row of registers) {
        console.log(`  ID: ${row.id}, Name: ${row.name}, Code: ${row.code}`);
      }
    } catch (err) {
      console.log("No pos_registers table or error:", err.message);
    }

    // Get recent transactions
    const txs = db.prepare("SELECT * FROM transactions ORDER BY rowid DESC LIMIT 5").all();
    console.log("\n=== LATEST TRANSACTIONS ===");
    for (const row of txs) {
      console.log(`  ID: ${row.id}, Number: ${row.number}, Date: ${row.date}`);
    }

    // Get recent einvoice docs and their transactions
    const docs = db.prepare("SELECT * FROM einvoice_docs ORDER BY rowid DESC LIMIT 10").all();
    console.log("\n=== LATEST E-INVOICES ===");
    for (const row of docs) {
      // Find transaction
      let txInfo = "UNKNOWN";
      try {
        const tx = db.prepare("SELECT number, tx_type_id, date FROM transactions WHERE id = ?").get(row.tx_id);
        if (tx) {
          // Find transaction type
          const txType = db.prepare("SELECT code, name FROM transaction_types WHERE id = ?").get(tx.tx_type_id);
          txInfo = `Num: ${tx.number}, Date: ${tx.date}, Type: ${txType ? txType.code : tx.tx_type_id}`;
        }
      } catch (err) {
        txInfo = "ERROR FETCHING TX: " + err.message;
      }
      
      console.log(`  ID: ${row.id}, Tx ID: ${row.tx_id} (${txInfo})`);
      console.log(`  Status: ${row.status}, SentAt: ${row.sent_at}`);
      console.log(`  Response: ${row.dian_response}`);
      console.log(`  XML Content Length: ${row.xml_content ? row.xml_content.length : 0}`);
      console.log("-----------------------------------------");
    }

    // Diagnostic query for the target transaction
    console.log("\n=== TARGET TRANSACTION DIAGNOSIS ===");
    const targetTxId = 'd6magnhc4r16oo2';
    const targetTx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(targetTxId);
    if (targetTx) {
      console.log("Transaction found:", targetTx);
      const targetInvoice = db.prepare("SELECT * FROM invoices WHERE tx_id = ?").get(targetTxId);
      console.log("Invoice in 'invoices' table:", targetInvoice || "NOT FOUND");
      const targetEInvoice = db.prepare("SELECT * FROM einvoice_docs WHERE tx_id = ?").get(targetTxId);
      console.log("E-Invoice in 'einvoice_docs' table:", targetEInvoice || "NOT FOUND");
    } else {
      console.log(`Transaction ${targetTxId} NOT FOUND`);
    }

  } catch (err) {
    console.error("Error:", err);
  }
}
run();
