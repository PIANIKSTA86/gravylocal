async function test() {
  const loginRes = await fetch("http://localhost:8089/api/collections/hub_users/auth-with-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "admin@contaco.com", password: "Admin1234!" })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  const compRes = await fetch("http://localhost:8089/api/hub/my-companies", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const compData = await compRes.json();
  const company = (compData.companies || [])[0];

  // 1. Toggle false
  const t1 = await fetch("http://localhost:8089/api/hub/toggle-license", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ company_id: company.company_id, module_key: "importaciones", enabled: false })
  });
  console.log("Disable importaciones:", t1.status, await t1.json());

  // 2. Toggle true
  const t2 = await fetch("http://localhost:8089/api/hub/toggle-license", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ company_id: company.company_id, module_key: "importaciones", enabled: true })
  });
  console.log("Enable importaciones:", t2.status, await t2.json());

  // 3. Check licenses in HUB
  const licRes = await fetch(`http://localhost:8089/api/collections/licenses/records?filter=(company_id='${company.company_id}'%26%26module_key='importaciones')`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  console.log("HUB licenses query for importaciones:", await licRes.json());
}

test().catch(console.error);
