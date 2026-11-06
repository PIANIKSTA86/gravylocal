const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db', sqlite3.OPEN_READONLY);

function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

async function simulate() {
  const txId = 'cni9njlt5wvhoqb';
  const tx = await queryOne("SELECT * FROM transactions WHERE id = ?", [txId]);
  const invoice = await queryOne("SELECT * FROM invoices WHERE tx_id = ?", [txId]);
  const docRecord = await queryOne("SELECT * FROM einvoice_docs WHERE tx_id = ?", [txId]);
  const resolutions = await queryAll("SELECT * FROM dian_resolutions WHERE active = 1");

  // Determine prefix and folio
  let docNumber = tx.number || "";
  let prefix = "";
  let folio = docNumber;
  if (docNumber.includes('-')) {
    const parts = docNumber.split('-');
    prefix = parts[0].trim();
    folio = parts.slice(1).join('-').trim();
  }
  folio = folio.replace(/[^0-9]/g, '').replace(/^0+/, '');
  if (!folio) folio = "0";

  // Find resolution for NC
  const resolution = resolutions.find(r => r.document_type === 'NC' && (!prefix || r.prefix === prefix)) || resolutions.find(r => r.document_type === 'NC');

  // FIXED LOGIC:
  let resNum = (resolution && resolution.resolution_number) ? resolution.resolution_number : "18760000001";
  const cleanDocNum = String(folio || tx.number || "1");
  let cleanPrefix = prefix || (resolution ? resolution.prefix : "") || "NCFE";

  console.log('=== SIMULATED RESOLUTION MATCH ===');
  console.log({
    txNumber: docNumber,
    parsedPrefix: prefix,
    parsedFolio: folio,
    matchedResolution: resolution,
    resNum,
    cleanPrefix,
    cleanDocNum
  });

  // Reference to parent invoice
  const crossDocRef = (invoice ? (invoice.cross_doc_ref || invoice.parent_invoice_id) : "") || (tx ? (tx.cross_number || tx.cross_doc_ref) : "") || "";
  let refNum = crossDocRef;
  let refUuid = "";
  let refDate = tx.date;

  if (invoice && invoice.notes) {
    const cufeMatch = invoice.notes.match(/CUFE:\s*([0-9a-fA-F]{64,128})/i);
    if (cufeMatch) refUuid = cufeMatch[1];
  }

  let cleanRefNum = refNum || "REF-001";
  if (cleanRefNum.includes('-')) {
    const parts = cleanRefNum.split('-');
    if (parts.length === 2 && /^\d+$/.test(parts[1])) {
      cleanRefNum = parts[0] + parseInt(parts[1], 10);
    }
  }

  const payload = {
    resolution_number: String(resNum),
    prefix: cleanPrefix,
    document_number: cleanDocNum,
    operation_type_id: 12, // 12 = Con referencia
    type_document_id: 5,   // 5 = Nota Crédito
    date: tx.date,
    time: "12:00:00",
    notes: tx.description,
    send_email: 0,
    billing_reference: {
      number: cleanRefNum,
      date: refDate,
      uuid: refUuid,
      scheme_name: "CUFE-SHA384"
    },
    discrepancy_response: {
      reference_id: cleanRefNum,
      response_id: "2",
      description: "Anulación de factura electrónica"
    },
    legal_monetary_totals: {
      line_extension_amount: parseFloat(invoice.subtotal).toFixed(2),
      tax_exclusive_amount: parseFloat(invoice.subtotal).toFixed(2),
      tax_inclusive_amount: parseFloat(invoice.total).toFixed(2),
      payable_amount: parseFloat(invoice.payable_total).toFixed(2)
    }
  };

  console.log('\n=== RESULTING MATIAS PAYLOAD ===');
  console.log(JSON.stringify(payload, null, 2));

  db.close();
}

simulate().catch(console.error);

