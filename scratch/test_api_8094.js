async function test() {
  const authRes = await fetch('http://127.0.0.1:8094/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'superadmin@gravy-ms.com', password: 'SuperAdmin2026*#' }) // let's check
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) {
    console.log('Auth failed:', authData);
    return;
  }
  const res = await fetch('http://127.0.0.1:8094/api/gravy/report-trial-balance?fromDate=2026-06-01&toDate=2026-06-30&includeThird=false&includeProperty=true', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Data count:', data.length);
  console.log('Sample item:', data[0]);
  const towers = new Set(data.map(d => d.propertyTower));
  console.log('Towers in data:', [...towers]);
}
test();
