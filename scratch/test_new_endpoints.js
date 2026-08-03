const pbUrl = 'http://127.0.0.1:8090';
const orchUrl = 'http://127.0.0.1:8088';

async function tryAuth() {
  try {
    const res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const data = await res.json();
    return data.token;
  } catch (e) {
    console.error("Auth error", e);
  }
  return null;
}

async function run() {
  const token = await tryAuth();
  if (!token) {
    console.error("Failed to authenticate");
    return;
  }

  // Find a transaction that already has an einvoice_doc
  console.log("Fetching einvoice_docs...");
  const docsRes = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?limit=1&filter=status="aceptada"||status="enviada"`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const docsData = await docsRes.json();
  
  if (!docsData.items || !docsData.items.length) {
    console.warn("No signed einvoice_docs records found to test. Let's try creating a mock accepted document.");
    
    // Create a mock doc Record first for testing
    // Let's get an invoice
    const invRes = await fetch(`${pbUrl}/api/collections/invoices/records?limit=1&filter=tx_id!=""`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const invData = await invRes.json();
    if (!invData.items || !invData.items.length) {
      console.error("No invoices found to link.");
      return;
    }
    const inv = invData.items[0];
    const txId = inv.tx_id;
    
    console.log(`Creating mock accepted document for Invoice ${inv.number} (Tx: ${txId})...`);
    // Delete any existing doc first
    await fetch(`${pbUrl}/api/collections/einvoice_docs/records?filter=tx_id="${txId}"`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json()).then(async (d) => {
      if (d.items && d.items.length) {
        await fetch(`${pbUrl}/api/collections/einvoice_docs/records/${d.items[0].id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
      }
    });

    const createRes = await fetch(`${pbUrl}/api/collections/einvoice_docs/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        tx_id: txId,
        status: 'aceptada',
        cufe: 'MOCK_CUFE_KEY_VAL_1234567890_987654321',
        dian_response: 'Documento procesado correctamente en modo simulado.',
        xml_content: '<?xml version="1.0" encoding="UTF-8"?><Invoice><ID>MOCK-01</ID></Invoice>',
        sent_at: new Date().toISOString()
      })
    });
    if (!createRes.ok) {
      console.error("Failed to create mock doc", await createRes.json());
      return;
    }
    const createdDoc = await createRes.json();
    testWithDoc(createdDoc, txId, token);
  } else {
    const doc = docsData.items[0];
    testWithDoc(doc, doc.tx_id, token);
  }
}

async function testWithDoc(doc, txId, token) {
  console.log(`\nTesting with doc id=${doc.id}, tx_id=${txId}, status=${doc.status}`);
  
  // 1. Test resend email
  console.log("\n--- Testing /api/dian/resend-email ---");
  const emailRes = await fetch(`${pbUrl}/api/dian/resend-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ txId })
  });
  console.log(`Email resend status: ${emailRes.status}`);
  const emailData = await emailRes.json();
  console.log("Response:", emailData);

  // 2. Test download ZIP from Orchestrator
  console.log("\n--- Testing Node Orchestrator /api/dian/download-zip ---");
  const zipRes = await fetch(`${orchUrl}/api/dian/download-zip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      xmlContent: doc.xml_content || '<?xml version="1.0"?><Invoice></Invoice>',
      filename: 'MOCK_TEST_FILE'
    })
  });
  console.log(`ZIP download status: ${zipRes.status}`);
  console.log(`Content-Type: ${zipRes.headers.get('content-type')}`);
  console.log(`Content-Disposition: ${zipRes.headers.get('content-disposition')}`);
  if (zipRes.ok) {
    const buffer = await zipRes.arrayBuffer();
    console.log(`Successfully received ZIP file, size: ${buffer.byteLength} bytes.`);
  } else {
    console.error("Failed to fetch ZIP", await zipRes.json());
  }
}

run();
