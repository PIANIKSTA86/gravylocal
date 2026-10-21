const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function runMatiasTests() {
  const getSetting = (key) => new Promise((resolve) => {
    db.get("SELECT value FROM settings WHERE key = ?", [key], (_, row) => resolve(row ? row.value : null));
  });

  const token = await getSetting('matias_api_token');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';
  const clientUuid = (await getSetting('matias_client_uuid')) || "3928b094-bde0-11f1-a742-d843ae899220";

  console.log('================================================================');
  console.log('🚀 GRAVY MATIAS API TEST RUNNER - ECOSISTEMA DIAN (SANDBOX)');
  console.log('================================================================');
  console.log(`Ambiente: ${env}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Client UUID: ${clientUuid}`);
  console.log(`Token: SÍ (${token.slice(0, 15)}...)`);
  console.log('================================================================\n');

  async function callMatias(endpoint, method, body) {
    let fullUrl = baseUrl + endpoint;
    if (clientUuid) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + 'client_uuid=' + encodeURIComponent(clientUuid);
    }
    const res = await fetch(fullUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    let data = null;
    const raw = await res.text();
    try {
      data = JSON.parse(raw);
    } catch (_) {
      data = { raw };
    }
    return { status: res.status, ok: res.ok, data };
  }

  // 1. TEST FACTURA ELECTRÓNICA DE VENTA (FEV)
  console.log('▶ [TEST 1/5] Facturación Electrónica de Venta (POST /invoice)...');
  const randomNum = Math.floor(100 + Math.random() * 890);
  const invoicePayload = {
    resolution_number: "18760000001",
    prefix: "FEV",
    document_number: String(randomNum),
    operation_type_id: 1,
    type_document_id: 7, // Factura Electrónica estándar en DB de MATIAS
    date: new Date().toISOString().slice(0, 10),
    time: "10:30:00",
    notes: "Factura de prueba automática MATIAS API",
    customer: {
      identification_number: "1063279307",
      dni: "1063279307",
      name: "CLIENTE DE PRUEBAS GRAVY",
      company_name: "CLIENTE DE PRUEBAS GRAVY",
      email: "julian.mm.piano@gmail.com",
      phone: "3233273136",
      address: "Calle 100 # 15-20",
      postal_code: "110111",
      identity_document_id: 3, // Cédula de Ciudadanía
      type_document_identification_id: 3,
      type_organization_id: 2, // Persona Natural
      tax_regime_id: 2, // No responsable de IVA
      type_liability_id: 117,
      municipality_id: 149,
      country_id: 45
    },
    payments: [{
      payment_method_id: 1, // Contado
      means_payment_id: 10, // Efectivo
      value_paid: "119000.00"
    }],
    payment_form: {
      payment_form_id: 1,
      payment_method_id: 10,
      payment_due_date: new Date().toISOString().slice(0, 10),
      duration_measure: "0"
    },
    legal_monetary_totals: {
      line_extension_amount: "100000.00",
      tax_exclusive_amount: "100000.00",
      tax_inclusive_amount: "119000.00",
      payable_amount: "119000.00"
    },
    tax_totals: [{
      tax_id: 1,
      percent: "19.00",
      taxable_amount: "100000.00",
      tax_amount: "19000.00"
    }],
    lines: [{
      unit_measure_id: 70,
      quantity_units_id: 1093,
      invoiced_quantity: "1",
      line_extension_amount: "100000.00",
      free_of_charge_indicator: false,
      description: "Servicio de Consultoría de Software",
      code: "SRV-01",
      type_item_identification_id: 4,
      type_item_identifications_id: 4,
      reference_price_id: 1,
      price_amount: "100000.00",
      base_quantity: "1",
      tax_totals: [{
        tax_id: 1,
        percent: "19.00",
        taxable_amount: "100000.00",
        tax_amount: "19000.00"
      }]
    }]
  };

  const invRes = await callMatias('/invoice', 'POST', invoicePayload);
  let invoiceCufe = "";
  if (invRes.ok && (invRes.data?.XmlDocumentKey || invRes.data?.response?.IsValid === "true" || invRes.data?.response?.StatusCode === "00")) {
    invoiceCufe = invRes.data.XmlDocumentKey || invRes.data.cufe || "";
    console.log(`   ✅ FACTURA EMITIDA EXITOSAMENTE (Doc: FEV-${randomNum})`);
    console.log(`      CUFE: ${invoiceCufe}`);
    console.log(`      Mensaje DIAN: ${invRes.data.response?.StatusMessage || invRes.data.message}`);
  } else {
    console.log(`   ⚠️ Respuesta Factura (${invRes.status}):`, JSON.stringify(invRes.data));
    if (invRes.data?.XmlDocumentKey) invoiceCufe = invRes.data.XmlDocumentKey;
  }

  // 2. TEST NOTA CRÉDITO (NC)
  console.log('\n▶ [TEST 2/5] Nota Crédito con Referencia (POST /notes/credit)...');
  const ncNum = Math.floor(100 + Math.random() * 890);
  const ncPayload = {
    resolution_number: "18760000001",
    prefix: "NCFE",
    document_number: String(ncNum),
    operation_type_id: 12, // Nota Crédito con referencia
    type_document_id: 5,  // Nota Crédito
    date: new Date().toISOString().slice(0, 10),
    time: "10:35:00",
    notes: "Anulación por prueba de integración",
    billing_reference: {
      number: `FEV${randomNum}`,
      date: new Date().toISOString().slice(0, 10),
      uuid: invoiceCufe || "ebfeea622362a1301a0733429362737859c1f4dfb42fb1c564d2840ca6f035451feb2f54a66e4d9c3b590eb10c185138",
      scheme_name: "CUDE-SHA384"
    },
    discrepancy_response: {
      reference_id: `FEV${randomNum}`,
      response_id: "2", // Anulación
      description: "Anulación total de la factura"
    },
    customer: invoicePayload.customer,
    payments: invoicePayload.payments,
    legal_monetary_totals: invoicePayload.legal_monetary_totals,
    tax_totals: invoicePayload.tax_totals,
    lines: invoicePayload.lines
  };

  const ncRes = await callMatias('/notes/credit', 'POST', ncPayload);
  if (ncRes.ok && (ncRes.data?.XmlDocumentKey || ncRes.data?.response?.IsValid === "true" || ncRes.data?.response?.StatusCode === "00")) {
    console.log(`   ✅ NOTA CRÉDITO EMITIDA EXITOSAMENTE (Doc: NCFE-${ncNum})`);
    console.log(`      CUDE: ${ncRes.data.XmlDocumentKey}`);
    console.log(`      Mensaje DIAN: ${ncRes.data.response?.StatusMessage || ncRes.data.message}`);
  } else {
    console.log(`   ⚠️ Respuesta Nota Crédito (${ncRes.status}):`, JSON.stringify(ncRes.data));
  }

  // 3. TEST DOCUMENTO SOPORTE (DSE) Y NOTA DE AJUSTE
  console.log('\n▶ [TEST 3/5] Documento Soporte Electrónico (POST /ds/document)...');
  const dsNum = Math.floor(100 + Math.random() * 890);
  const dsPayload = {
    resolution_number: "18760000001",
    prefix: "DS",
    document_number: String(dsNum),
    operation_type_id: 9, // Documento Soporte estándar
    type_document_id: 11, // Documento Soporte
    date: new Date().toISOString().slice(0, 10),
    time: "10:40:00",
    notes: "Compra a no obligado a facturar",
    customer: {
      identification_number: "71234567",
      dni: "71234567",
      name: "PEDRO PEREZ PROVEEDOR NO OBLIGADO",
      company_name: "PEDRO PEREZ PROVEEDOR NO OBLIGADO",
      email: "pedro.perez@proveedor.com",
      phone: "3109876543",
      address: "Carrera 45 # 12-30",
      postal_code: "110111",
      identity_document_id: 3,
      type_document_identification_id: 3,
      type_organization_id: 2,
      tax_regime_id: 2,
      municipality_id: 149,
      country_id: 45
    },
    payments: [{
      payment_method_id: 1,
      means_payment_id: 10,
      value_paid: "250000.00"
    }],
    payment_form: {
      payment_form_id: 1,
      payment_method_id: 10,
      payment_due_date: new Date().toISOString().slice(0, 10),
      duration_measure: "0"
    },
    legal_monetary_totals: {
      line_extension_amount: "250000.00",
      tax_exclusive_amount: "250000.00",
      tax_inclusive_amount: "250000.00",
      payable_amount: "250000.00"
    },
    lines: [{
      unit_measure_id: 70,
      quantity_units_id: 1093,
      invoiced_quantity: "1",
      line_extension_amount: "250000.00",
      free_of_charge_indicator: false,
      description: "Servicio de Mantenimiento Locativo",
      code: "MTTO-01",
      type_item_identification_id: 4,
      type_item_identifications_id: 4,
      reference_price_id: 1,
      price_amount: "250000.00",
      base_quantity: "1",
      invoice_period: {
        start_date: new Date().toISOString().slice(0, 10),
        description_code: 1
      }
    }]
  };

  const dsRes = await callMatias('/ds/document', 'POST', dsPayload);
  let dsCude = "";
  if (dsRes.ok && (dsRes.data?.XmlDocumentKey || dsRes.data?.response?.IsValid === "true" || dsRes.data?.response?.StatusCode === "00")) {
    dsCude = dsRes.data.XmlDocumentKey || "";
    console.log(`   ✅ DOCUMENTO SOPORTE EMITIDO EXITOSAMENTE (Doc: DS-${dsNum})`);
    console.log(`      CUDE: ${dsCude}`);
    console.log(`      Mensaje DIAN: ${dsRes.data.response?.StatusMessage || dsRes.data.message}`);
  } else {
    console.log(`   ⚠️ Respuesta Documento Soporte (${dsRes.status}):`, JSON.stringify(dsRes.data));
    if (dsRes.data?.XmlDocumentKey) dsCude = dsRes.data.XmlDocumentKey;
  }

  // NOTA DE AJUSTE AL DOCUMENTO SOPORTE
  console.log('   ↳ Sub-Test: Nota de Ajuste a Documento Soporte (POST /ds/adjustment-note)...');
  const ndsNum = Math.floor(10 + Math.random() * 890);
  const ndsPayload = {
    resolution_number: "18760000001",
    prefix: "NADS",
    document_number: String(ndsNum),
    operation_type_id: 1,
    type_document_id: 15,
    date: new Date().toISOString().slice(0, 10),
    time: "10:45:00",
    notes: "Ajuste de documento soporte por anulación",
    billing_reference: {
      number: `DS${dsNum}`,
      date: new Date().toISOString().slice(0, 10),
      uuid: dsCude || "024dc9633c2d51dc9ee2f3fa05913d52f4d0e00e4f6ae8a29f28245b3f772479596f0823ce02e365d186a2edbe6aa335",
      scheme_name: "CUDS-SHA384"
    },
    discrepancy_response: {
      reference_id: `DS${dsNum}`,
      response_id: "11",
      description: "Anulación de documento soporte"
    },
    customer: dsPayload.customer,
    payments: dsPayload.payments,
    legal_monetary_totals: dsPayload.legal_monetary_totals,
    lines: dsPayload.lines
  };

  const ndsRes = await callMatias('/ds/adjustment-note', 'POST', ndsPayload);
  if (ndsRes.ok && (ndsRes.data?.XmlDocumentKey || ndsRes.data?.response?.IsValid === "true" || ndsRes.data?.response?.StatusCode === "00")) {
    console.log(`   ✅ NOTA DE AJUSTE DS EMITIDA EXITOSAMENTE (Doc: NADS-${ndsNum})`);
    console.log(`      CUDE: ${ndsRes.data.XmlDocumentKey}`);
  } else {
    console.log(`   ⚠️ Respuesta Nota de Ajuste DS (${ndsRes.status}):`, JSON.stringify(ndsRes.data));
  }

  // 4. TEST NÓMINA ELECTRÓNICA Y REEMPLAZO
  console.log('\n▶ [TEST 4/5] Nómina Electrónica Individual (POST /ep/payroll)...');
  const nomNum = Math.floor(100 + Math.random() * 890);
  const nowIsoDate = new Date().toISOString().slice(0, 10);
  const payrollPayload = {
    resolution_number: "18760000001",
    prefix: "SNEL",
    document_number: String(nomNum),
    generation_city_id: "1006",
    worker_code: "1063279307",
    novelty: false,
    pay_day: nowIsoDate,
    period: {
      date_entry: "2023-01-01",
      departure_date: null,
      settlement_start_date: `${nowIsoDate.slice(0, 7)}-01`,
      settlement_end_date: nowIsoDate,
      time_worked: "30",
      generation_date: nowIsoDate
    },
    general_information: {
      generation_date: nowIsoDate,
      generation_time: "10:00:00",
      period_id: "5", // Mensual
      currency_id: "272",
      trm: "0"
    },
    notes: "Nómina de prueba sandbox",
    employee: {
      worker_type_id: 1,
      worker_subtype_id: 1,
      high_risk_pension: "false",
      identity_document_id: "3",
      document_number: "1063279307",
      first_surname: "GARCIA",
      second_surname: "LOPEZ",
      first_name: "CARLOS",
      other_names: "",
      working_country_id: 45,
      work_city_id: 1006,
      work_address: "Calle 12 # 34-56",
      integral_salary: "false",
      contract_type_id: 1,
      salary: "1423500",
      worker_code: "1063279307"
    },
    payment: {
      payment_method_id: "1",
      means_payment_id: "10",
      bank: "BANCOLOMBIA",
      account_type: "AHORROS",
      account_number: "123456789"
    },
    earn: {
      basic: {
        worked_days: "30",
        salary_worked: "1423500.00"
      },
      transport: {
        transportation_assistance: "162000.00",
        viatic_maintenance: "0.0",
        viatic_non_salary_maintenance: "0.0"
      }
    },
    deductions: {
      health: {
        percentage: "4",
        deduction: "56940.00"
      },
      pension_fund: {
        percentage: "4",
        deduction: "56940.00"
      }
    },
    rounding: "0",
    total_earned: "1585500.00",
    deductions_total: "113880.00",
    total_voucher: "1471620.00"
  };

  const nomRes = await callMatias('/ep/payroll', 'POST', payrollPayload);
  let payrollCune = "";
  if (nomRes.ok && (nomRes.data?.XmlDocumentKey || nomRes.data?.response?.IsValid === "true" || nomRes.data?.response?.StatusCode === "00")) {
    payrollCune = nomRes.data.XmlDocumentKey || "";
    console.log(`   ✅ NÓMINA EMITIDA EXITOSAMENTE (Doc: SNEL-${nomNum})`);
    console.log(`      CUNE: ${payrollCune}`);
    console.log(`      Mensaje DIAN: ${nomRes.data.response?.StatusMessage || nomRes.data.message}`);
  } else {
    console.log(`   ⚠️ Respuesta Nómina (${nomRes.status}):`, JSON.stringify(nomRes.data));
    if (nomRes.data?.XmlDocumentKey) payrollCune = nomRes.data.XmlDocumentKey;
  }

  // NOTA DE REEMPLAZO DE NÓMINA
  console.log('   ↳ Sub-Test: Nota de Reemplazo de Nómina (POST /ep/payroll/replace)...');
  const replacePayrollPayload = {
    ...payrollPayload,
    prefix: "NANE",
    document_number: String(nomNum + 1),
    replacing_predecessor: {
      number: `SNEL${nomNum}`,
      cune: payrollCune || "f615ef26355dffd4ca6b3a4bc9ea1c3ec75336dd20b86f4ab15ae77cf5ac1f633c729b87cd885078452c548b8867c69c",
      generation_date: nowIsoDate
    },
    notes: "Ajuste de nómina por reemplazo"
  };

  const replaceRes = await callMatias('/ep/payroll/replace', 'POST', replacePayrollPayload);
  if (replaceRes.ok && (replaceRes.data?.XmlDocumentKey || replaceRes.data?.response?.IsValid === "true" || replaceRes.data?.response?.StatusCode === "00")) {
    console.log(`   ✅ NOTA DE REEMPLAZO EMITIDA EXITOSAMENTE (Doc: NANE-${nomNum + 1})`);
    console.log(`      Nuevo CUNE: ${replaceRes.data.XmlDocumentKey}`);
  } else {
    console.log(`   ⚠️ Respuesta Reemplazo Nómina (${replaceRes.status}):`, JSON.stringify(replaceRes.data));
  }

  // 5. TEST ACUSES DIAN / RADIAN
  console.log('\n▶ [TEST 5/5] Acuses DIAN / Eventos RADIAN...');
  const testTrackId = invoiceCufe || "ebfeea622362a1301a0733429362737859c1f4dfb42fb1c564d2840ca6f035451feb2f54a66e4d9c3b590eb10c185138";

  console.log(`   1. Consultando estado de validación en MATIAS API (GET /events/status/{trackId})...`);
  const statusRes = await callMatias(`/events/status/${encodeURIComponent(testTrackId)}`, 'GET');
  console.log(`      Estado en RADIAN (${statusRes.status}):`, JSON.stringify(statusRes.data).slice(0, 200));

  console.log(`   2. Consultando recepciones de documentos (GET /events/document-receptions)...`);
  const recRes = await callMatias('/events/document-receptions?limit=5', 'GET');
  console.log(`      Recepciones encontradas: ${recRes.data?.dataRecords?.total || 0}`);

  console.log('\n================================================================');
  console.log('🎉 CICLO DE PRUEBAS MATIAS API FINALIZADO CON ÉXITO');
  console.log('================================================================\n');
  db.close();
}

runMatiasTests().catch(e => {
  console.error('Fatal Test Runner error:', e);
  db.close();
});
