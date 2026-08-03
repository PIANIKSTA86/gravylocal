async function runRecalc() {
  const pbUrl = 'http://localhost:8090';
  try {
    const loginRes = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    console.log("Calling recalculate-stock...");
    const recalcRes = await fetch(`${pbUrl}/api/gravy/recalculate-stock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("Recalc response status:", recalcRes.status);
    const recalcData = await recalcRes.json();
    console.log("Recalc response body:", recalcData);
  } catch (err) {
    console.error("Error:", err);
  }
}
runRecalc();
