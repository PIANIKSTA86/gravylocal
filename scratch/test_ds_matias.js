const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function testMatiasDocSoporte() {
  const getSetting = (key) => new Promise((resolve) => {
    db.get("SELECT value FROM settings WHERE key = ?", [key], (_, row) => resolve(row ? row.value : null));
  });

  const token = await getSetting('matias_api_token');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';
  const clientUuid = await getSetting('matias_client_uuid');

  console.log('Ambiente:', env);
  console.log('Base URL:', baseUrl);
  console.log('Client UUID:', clientUuid);

  async function callMatias(endpoint, method, body) {
    let fullUrl = baseUrl + endpoint;
    if (clientUuid) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + 'client_uuid=' + encodeURIComponent(clientUuid);
    }
    const res = await fetch(fullUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch (_) { data = { raw }; }
    return { status: res.status, ok: res.ok, data };
  }

  console.log('\n--- Probando POST /ds/document con Resolución Oficial MATIAS ---');
  const dsNum = Math.floor(100 + Math.random() * 800);
  const today = new Date().toISOString().slice(0, 10);
  const payload = {
    resolution_number: "18760000001",
    prefix: "DS",
    document_number: String(dsNum),
    operation_type_id: 9,
    type_document_id: 11,
    date: today,
    time: "10:30:00",
    notes: "Documento soporte prueba tecnica MATIAS API",
    send_email: 0,
    customer: {
      identification_number: "1144123456",
      dni: "1144123456",
      name: "CARLOS ALBERTO RESTREPO",
      company_name: "CARLOS ALBERTO RESTREPO",
      email: "proveedor@noobligado.com",
      phone: "3123456789",
      address: "Carrera 15 # 8-20",
      postal_code: "760001",
      identity_document_id: 3,
      type_document_identification_id: 3,
      type_organization_id: 2,
      tax_regime_id: 2,
      tax_level_id: 5,
      type_liability_id: 117,
      municipality_id: 1006, // Cali
      country_id: 45
    },
    payments: [{
      payment_method_id: 1,
      means_payment_id: 10,
      value_paid: "150000.00",
      payment_due_date: today
    }],
    payment_form: {
      payment_form_id: 1,
      payment_method_id: 10,
      payment_due_date: today,
      duration_measure: "0"
    },
    legal_monetary_totals: {
      line_extension_amount: "150000.00",
      tax_exclusive_amount: "150000.00",
      tax_inclusive_amount: "150000.00",
      payable_amount: "150000.00"
    },
    tax_totals: [{
      tax_id: 1,
      percent: "0.00",
      taxable_amount: "150000.00",
      tax_amount: "0.00"
    }],
    lines: [{
      unit_measure_id: 70,
      quantity_units_id: 70,
      invoiced_quantity: "1",
      line_extension_amount: "150000.00",
      free_of_charge_indicator: false,
      description: "Servicios de Plomeria y Reparacion Locativa",
      code: "SERV-01",
      type_item_identification_id: 4,
      type_item_identifications_id: 4,
      reference_price_id: 1,
      price_amount: "150000.00",
      base_quantity: "1",
      invoice_period: {
        start_date: today,
        description_code: 1
      },
      tax_totals: [{
        tax_id: 1,
        percent: "0.00",
        taxable_amount: "150000.00",
        tax_amount: "0.00"
      }]
    }]
  };

  const dsRes = await callMatias('/ds/document', 'POST', payload);
  console.log('Respuesta Status:', dsRes.status);
  console.log('Respuesta Data:', JSON.stringify(dsRes.data, null, 2));

  db.close();
}

testMatiasDocSoporte().catch(console.error);
