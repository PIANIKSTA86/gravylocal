async function run() {
  try {
    const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const loginData = await login.json();
    const token = loginData.token;
    if (!token) {
      console.log("Login failed:", loginData);
      return;
    }

    const res = await fetch('http://127.0.0.1:8090/api/collections/financial_notes', {
      headers: { 'Authorization': token }
    });
    const data = await res.json();
    console.log("=== COLLECTION SCHEMA ===");
    console.log(JSON.stringify(data.fields, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
