async function checkExactError() {
  const payload = {
    code: "15200501",
    name: "BALANZA ELECTRONICA JCM FIBR",
    cost: 135000,
    category_id: "jjg9ylysacr2h41",
    is_depreciable: false,
    useful_life_niif: 0,
    useful_life_fiscal: 0,
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

  const res = await fetch("http://127.0.0.1:8090/api/collections/niif_assets/records/t0be3bzx6l1wzvg", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

checkExactError();
