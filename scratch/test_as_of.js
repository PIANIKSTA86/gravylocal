async function testAsOf() {
  try {
    const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'password123' })
    });
    const authData = await authRes.json();
    const token = authData.token;
    console.log("Auth token obtained:", !!token);

    const res = await fetch('http://127.0.0.1:8090/api/gravy/report-inventory-as-of?asOfDate=2026-07-30', {
      headers: { 'Authorization': token }
    });
    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response body:", text);
  } catch (err) {
    console.error("Test error:", err);
  }
}
testAsOf();
