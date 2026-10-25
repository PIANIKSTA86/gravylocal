async function testEndpoints() {
  const loginRes = await fetch("http://localhost:8094/api/collections/users/auth-with-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "admin@contaco.com", password: "Admin1234!" })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.log('Login error:', loginData);
    return;
  }
  const token = loginData.token;
  console.log('Token obtained successfully.');

  const endpoints = [
    "/api/gravy/report-journal?fromDate=2026-10-01&toDate=2026-10-31&txTypeId=&book_type=local",
    "/api/gravy/report-journal?fromDate=2026-10-01&toDate=2026-10-31&txTypeId=&book_type=niif",
    "/api/gravy/report-trial-balance?fromDate=2026-10-01&toDate=2026-10-31&book_type=local",
    "/api/gravy/report-trial-balance?fromDate=2026-10-01&toDate=2026-10-31&book_type=niif",
    "/api/gravy/report-balances?endDate=2026-10-31&book_type=local",
    "/api/gravy/report-balances?endDate=2026-10-31&book_type=niif",
    "/api/gravy/report-auxiliary?fromDate=2026-10-01&toDate=2026-10-31&book_type=local",
    "/api/gravy/report-auxiliary?fromDate=2026-10-01&toDate=2026-10-31&book_type=niif",
    "/api/gravy/report-cost-centers?fromDate=2026-10-01&toDate=2026-10-31&book_type=local",
    "/api/gravy/report-cost-centers?fromDate=2026-10-01&toDate=2026-10-31&book_type=niif",
    "/api/gravy/account-saldos?period=2026-10&book_type=local",
    "/api/gravy/account-saldos?period=2026-10&book_type=niif"
  ];

  for (const ep of endpoints) {
    const res = await fetch(`http://localhost:8094${ep}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const text = await res.text();
    let preview = '';
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        preview = `Array count: ${parsed.length}`;
      } else if (parsed && typeof parsed === 'object') {
        preview = `Object keys: ${Object.keys(parsed).join(', ')}`;
      }
    } catch {
      preview = text.slice(0, 100);
    }
    console.log(`[${res.status}] ${ep} -> ${preview}`);
  }
}

testEndpoints();
