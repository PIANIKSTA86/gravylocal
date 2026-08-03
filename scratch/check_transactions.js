const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token };

    // Fetch transactions
    const res = await fetch(`${pbUrl}/api/collections/transactions/records?perPage=10&sort=-created`, { headers });
    const txData = await res.json();
    
    console.log("=== TRANSACTIONS ===");
    for (const tx of txData.items || []) {
      console.log(`Tx ID: ${tx.id} | Number: ${tx.number} | Date: ${tx.date} | Status: ${tx.status}`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
