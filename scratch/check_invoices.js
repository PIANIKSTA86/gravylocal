const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());
  
  if (!login.token) {
    console.log("No token");
    return;
  }
  const token = login.token;
  
  // Fetch transactions of type FV
  const txsRes = await fetch(`${url}/transactions/records?perPage=10&sort=-created`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  
  console.log("RECENT TRANSACTIONS:");
  for (const tx of txsRes.items || []) {
    // Expand transaction type
    const txType = await fetch(`${url}/transaction_types/records/${tx.tx_type_id}`, {
      headers: { 'Authorization': token }
    }).then(r => r.json());
    
    console.log(`ID: ${tx.id}, Number: ${tx.number}, Type: ${txType.code} (Prefix: ${txType.prefix}), Amount: ${tx.amount}`);
  }
}
run();
