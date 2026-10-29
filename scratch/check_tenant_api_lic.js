async function check() {
  const loginRes = await fetch("http://127.0.0.1:8090/api/collections/users/auth-with-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "admin@contaco.com", password: "Admin1234!" })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  const res = await fetch("http://127.0.0.1:8090/api/gravy/my-licenses", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  console.log("Tenant my-licenses:", await res.json());

  const full = await fetch("http://127.0.0.1:8090/api/collections/licenses/records?perPage=50", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const fullData = await full.json();
  console.log("Full licenses in tenant:", (fullData.items || []).map(i => ({ key: i.module_key, enabled: i.enabled })));
}

check().catch(console.error);
