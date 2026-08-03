const url = 'http://127.0.0.1:8090/api/collections';

async function check() {
  try {
    const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    }).then(r => r.json());
    
    if (!login.token) {
      console.log("No token", login);
      return;
    }
    const token = login.token;
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    // Let's print the latest 5 transaction records
    const txs = await fetch(`${url}/transactions/records?sort=-created&perPage=5&expand=tx_type_id`, { headers }).then(r => r.json());
    console.log("\n=== LATEST TRANSACTIONS ===");
    if (txs.items) {
      for (const item of txs.items) {
        console.log(`ID: ${item.id}, Number: ${item.number}, Date: ${item.date}, Type: ${item.expand?.tx_type_id?.code}`);
      }
    } else {
      console.log("No transactions found", txs);
    }

    // Let's print the latest 5 einvoice_docs records
    const docs = await fetch(`${url}/einvoice_docs/records?sort=-created&perPage=5`, { headers }).then(r => r.json());
    console.log("\n=== LATEST E-INVOICES ===");
    if (docs.items) {
      for (const doc of docs.items) {
        console.log(`ID: ${doc.id}, Tx ID: ${doc.tx_id}, Status: ${doc.status}, SentAt: ${doc.sent_at}, Response: ${doc.dian_response.slice(0, 100)}`);
      }
    } else {
      console.log("No einvoice_docs found", docs);
    }

    // Let's print resolutions
    const resols = await fetch(`${url}/dian_resolutions/records?perPage=50`, { headers }).then(r => r.json());
    console.log("\n=== RESOLUTIONS ===");
    if (resols.items) {
      for (const item of resols.items) {
        console.log(`Prefix: ${item.prefix}, Active: ${item.active}, Type: ${item.document_type}, ResNo: ${item.resolution_number}, From: ${item.number_from}, To: ${item.number_to}`);
      }
    }

  } catch(e) {
    console.error("Fetch error:", e);
  }
}

check();
