const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

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

async function simulateNc466Payload() {
  const txId = 'mub35nz2gysbzuf';
  const invoice = await queryOne("SELECT * FROM invoices WHERE tx_id = ?", [txId]);
  const tx = await queryOne("SELECT * FROM transactions WHERE id = ?", [txId]);
  const lines = await queryAll("SELECT * FROM invoice_lines WHERE invoice_id = ?", [invoice.id]);
  const customer = await queryOne("SELECT * FROM third_parties WHERE id = ?", [invoice.customer_id]);
  const resolutions = await queryAll("SELECT * FROM dian_resolutions WHERE active = 1");

  const txDesc = tx ? tx.description : "";
  const invNotes = invoice ? (invoice.notes || "") : "";
  const sinReferencia = txDesc.includes("[SIN_REFERENCIA]") || invNotes.includes("[SIN_REFERENCIA]");

  let matiasEndpoint = "/notes/credit";
  let matiasTypeDocId = 5;
  let matiasOperationTypeId = sinReferencia ? 15 : 12;

  let docNumber = invoice.number || tx.number || "";
  let prefix = "";
  let folio = docNumber;
  if (docNumber.includes('-')) {
    const parts = docNumber.split('-');
    prefix = parts[0].trim();
    folio = parts.slice(1).join('-').trim();
  }
  folio = folio.replace(/[^0-9]/g, '').replace(/^0+/, '');
  if (!folio) folio = "0";

  const resolution = resolutions.find(r => r.document_type === 'NC' && (!prefix || r.prefix === prefix)) || resolutions.find(r => r.document_type === 'NC');
  const resNum = (resolution && resolution.resolution_number) ? resolution.resolution_number : "18760000001";
  const cleanDocNum = String(folio);
  const cleanPrefix = prefix || (resolution ? resolution.prefix : "") || "NC";

  const payload = {
    resolution_number: String(resNum),
    prefix: cleanPrefix,
    document_number: cleanDocNum,
    operation_type_id: matiasOperationTypeId,
    type_document_id: matiasTypeDocId,
    date: invoice.date,
    time: "16:26:51",
    notes: invoice.notes,
    send_email: 0,
    customer: {
      identification_number: customer.identification_number || customer.dni,
      name: customer.name || customer.business_name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email,
      merchant_registration: "0000000-00",
      type_document_identification_id: 3,
      type_organization_id: 1,
      type_regime_id: 1,
      tax_regime_id: 1
    },
    lines_count: lines.length,
    legal_monetary_totals: {
      line_extension_amount: parseFloat(invoice.subtotal).toFixed(2),
      tax_exclusive_amount: parseFloat(invoice.subtotal).toFixed(2),
      tax_inclusive_amount: parseFloat(invoice.total).toFixed(2),
      payable_amount: parseFloat(invoice.payable_total).toFixed(2)
    }
  };

  if (sinReferencia) {
    let discrepancyCode = invoice.dian_concept || "5";
    if (discrepancyCode !== "3" && discrepancyCode !== "5") {
      discrepancyCode = "5";
    }
    const discrepancyDesc = invoice.notes || "Nota Crédito sin referencia a facturas";
    payload.discrepancy_response = {
      reference_id: cleanPrefix + cleanDocNum,
      response_id: String(discrepancyCode),
      description: discrepancyDesc.replace(/\[.*?\]\s*/g, '').trim() || "Otros"
    };
  }

  console.log("=== SIMULATED MATIAS PAYLOAD FOR NC-00000466 ===");
  console.log(JSON.stringify(payload, null, 2));

  db.close();
}

simulateNc466Payload().catch(console.error);
