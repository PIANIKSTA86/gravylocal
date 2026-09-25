async function testPatch() {
  const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  const authData = await authRes.json();
  const token = authData.token;

  const payload = {
    code: "15200501",
    name: "BALANZA ELECTRONICA JCM FIBR",
    cost: 135000,
    category_id: "jjg9ylysacr2h41",
    is_depreciable: false,
    useful_life_niif: 120,
    useful_life_fiscal: 120,
    residual_value: 0,
    initial_depreciation_niif: 0,
    initial_depreciation_fiscal: 0,
    depreciation_method: "linea_recta",
    cost_center_id: null,
    owner_id: null,
    location: "",
    parent_asset_id: null,
    provider_id: "a9tgerdmtk5cymw",
    invoice_number: "",
    invoice_date: "2024-07-25",
    purchase_date: "2024-07-25",
    start_service_date: "2024-07-25",
    brand: "",
    model: "15200501",
    photo_url: "",
    qr_code: "Id. ActFijo No. 15200501",
    status: "active",
    active: true
  };

  const patchRes = await fetch('http://127.0.0.1:8090/api/collections/niif_assets/records/t0be3bzx6l1wzvg', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('PATCH Status:', patchRes.status, patchRes.statusText);
  const patchData = await patchRes.json();
  console.log('Response body:', JSON.stringify(patchData, null, 2));
}

testPatch().catch(console.error);
