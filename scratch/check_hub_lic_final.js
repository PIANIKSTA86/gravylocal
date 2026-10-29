async function checkHub() {
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
  console.log("Company:", company.company_name);
  console.log("Modules in HUB for company:", company.modules);

  const licRes = await fetch(`http://localhost:8089/api/collections/licenses/records?filter=(company_id='${company.company_id}')&perPage=50`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const licData = await licRes.json();
  console.log("All licenses in HUB for company:", (licData.items || []).map(i => ({ key: i.module_key, enabled: i.enabled })));
}

checkHub().catch(console.error);
