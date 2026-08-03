const pbUrl = 'http://127.0.0.1:8090';

async function test(label, path) {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token };

    const res = await fetch(`${pbUrl}/api/collections/${path}`, { headers });
    const data = await res.json();
    console.log(`[${label}] Status: ${res.status} | Ok: ${res.ok}`);
    if (!res.ok) {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  // Test inmo_property_history
  await test("History with -date,-created", "inmo_property_history/records?filter=property_id=\"mxcn613y1hf8irh\"&sort=-date,-created");
  await test("History with -date", "inmo_property_history/records?filter=property_id=\"mxcn613y1hf8irh\"&sort=-date");
  await test("History with -created", "inmo_property_history/records?filter=property_id=\"mxcn613y1hf8irh\"&sort=-created");
  await test("History without sort", "inmo_property_history/records?filter=property_id=\"mxcn613y1hf8irh\"");

  // Test inmo_contracts
  await test("Contracts with -created", "inmo_contracts/records?filter=property_id=\"ud7j0hz6drapunj\"&sort=-created");
  await test("Contracts with -id", "inmo_contracts/records?filter=property_id=\"ud7j0hz6drapunj\"&sort=-id");
  await test("Contracts with -number", "inmo_contracts/records?filter=property_id=\"ud7j0hz6drapunj\"&sort=-number");
  await test("Contracts without sort", "inmo_contracts/records?filter=property_id=\"ud7j0hz6drapunj\"");
}
run();
