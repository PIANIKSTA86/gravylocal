const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    // 1. Auth as superuser
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    // 2. Set einvoice_method to facturatech and ftech_password to mock
    console.log("Configuring settings for Facturatech mock test...");
    
    // Fetch settings to find the IDs
    const settingsRes = await fetch(`${pbUrl}/api/collections/settings/records?perPage=100`, { headers });
    const settings = await settingsRes.json();
    
    const methodSetting = settings.items.find(s => s.key === 'einvoice_method');
    const pwdSetting = settings.items.find(s => s.key === 'ftech_password');
    
    if (methodSetting) {
      await fetch(`${pbUrl}/api/collections/settings/records/${methodSetting.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ value: 'facturatech' })
      });
    }
    if (pwdSetting) {
      await fetch(`${pbUrl}/api/collections/settings/records/${pwdSetting.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ value: 'mock_password' }) // Set to mock to run simulated flow
      });
    }

    // 3. Delete existing einvoice_docs for tx_id 2zwp7c158csdnl5
    const txId = '2zwp7c158csdnl5';
    const docRes = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?filter=tx_id="${txId}"`, { headers });
    const docs = await docRes.json();
    if (docs.items && docs.items.length) {
      const doc = docs.items[0];
      console.log(`Deleting existing doc record ${doc.id} for transaction ${txId}...`);
      await fetch(`${pbUrl}/api/collections/einvoice_docs/records/${doc.id}`, {
        method: 'DELETE',
        headers
      });
    }

    // 4. Trigger emit endpoint
    console.log("Triggering /api/dian/emit...");
    const emitRes = await fetch(`${pbUrl}/api/dian/emit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ txId })
    });

    const emitData = await emitRes.json();
    console.log("\nEmit result status:", emitRes.status);
    console.log("Emit response:", JSON.stringify(emitData, null, 2));

    // 5. Fetch updated einvoice_docs to inspect the XML content
    const updatedDocRes = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?filter=tx_id="${txId}"`, { headers });
    const updatedDocs = await updatedDocRes.json();
    if (updatedDocs.items && updatedDocs.items.length) {
      const updatedDoc = updatedDocs.items[0];
      console.log("\n=== GENERATED XML ===");
      console.log(updatedDoc.xml_content);
    } else {
      console.log("No einvoice_docs record found after emit!");
    }

  } catch (err) {
    console.error("Error running test:", err);
  }
}

run();
