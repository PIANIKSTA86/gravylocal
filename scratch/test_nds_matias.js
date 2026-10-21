const http = require('http');
const sqlite3 = require('sqlite3').verbose();

async function testNdsFlow() {
  console.log('================================================================');
  console.log('🧪 TEST: NOTA DE AJUSTE DE DOCUMENTO SOPORTE (NDS / NADS)');
  console.log('================================================================\n');

  const BASE_URL = 'http://127.0.0.1:8099';

  function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const req = http.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(data); } catch (_) { json = { raw: data }; }
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
        });
      });
      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  // Auth superuser
  const authRes = await request('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { identity: 'test@admin.com', password: '1234567890' }
  });
  const token = authRes.data?.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const db = new sqlite3.Database('pb_data/data.db');
  const queryDb = (q) => new Promise(res => db.all(q, (e, r) => res(r || [])));

  const thirds = await queryDb("SELECT id FROM third_parties WHERE doc_type IN ('CC', '13') LIMIT 1");
  const thirdId = thirds[0]?.id;
  const dsTypes = await queryDb("SELECT id FROM transaction_types WHERE code = 'DS' LIMIT 1");
  const dsTypeId = dsTypes[0]?.id;
  const ndsTypes = await queryDb("SELECT id FROM transaction_types WHERE code = 'NDS' LIMIT 1");
  const ndsTypeId = ndsTypes[0]?.id;

  console.log('1. Emitiendo Documento Soporte Padre (DS)...');
  const txPadre = await request('/api/collections/transactions/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      date: new Date().toISOString().slice(0, 10),
      third_party_id: thirdId,
      tx_type_id: dsTypeId,
      net_amount: 80000,
      cross_amount: 80000,
      status: 'active',
      description: 'Documento Soporte a ajustar'
    }
  });

  const purPadre = await request('/api/collections/purchase_invoices/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      tx_id: txPadre.data.id,
      number: 'DS-0099',
      date: new Date().toISOString().slice(0, 10),
      supplier_id: thirdId,
      tx_type_id: dsTypeId,
      subtotal: 80000,
      total: 80000,
      status: 'posted',
      status_dian: 'pendiente'
    }
  });

  const linePadre = await request('/api/collections/purchase_invoice_lines/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      invoice_id: purPadre.data.id,
      description: 'Reparación de cerraduras',
      qty: 1,
      unit_price: 80000,
      subtotal: 80000,
      total: 80000,
      iva_rate: 0,
      iva_amount: 0
    }
  });

  const emitPadre = await request('/api/dian/emit', {
    method: 'POST',
    headers: authHeaders,
    body: { txId: txPadre.data.id, isDocSoporte: true }
  });

  console.log(`   Documento Soporte Padre Emitido: status ${emitPadre.status}, CUDS: ${emitPadre.data?.cufe || emitPadre.data?.cuds}`);

  // Refrescar purchase_invoice padre para obtener el número oficial y CUDS
  const checkPurPadre = await request(`/api/collections/purchase_invoices/records/${purPadre.data.id}`, { headers: authHeaders });
  const parentNumber = checkPurPadre.data?.number;
  const parentCuds = checkPurPadre.data?.cuds;
  console.log(`   Datos Padre: Número=${parentNumber}, CUDS=${parentCuds}`);

  console.log('\n2. Creando y Emitiendo Nota de Ajuste (NDS)...');
  const txNds = await request('/api/collections/transactions/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      date: new Date().toISOString().slice(0, 10),
      third_party_id: thirdId,
      tx_type_id: ndsTypeId,
      net_amount: 80000,
      cross_amount: 80000,
      cross_number: parentNumber,
      status: 'active',
      description: `Nota de Ajuste a ${parentNumber}`
    }
  });

  const purNds = await request('/api/collections/purchase_invoices/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      tx_id: txNds.data.id,
      parent_invoice_id: purPadre.data.id,
      cross_doc_ref: parentNumber,
      number: 'NADS-0099',
      date: new Date().toISOString().slice(0, 10),
      supplier_id: thirdId,
      tx_type_id: ndsTypeId,
      subtotal: 80000,
      total: 80000,
      status: 'posted',
      status_dian: 'pendiente',
      notes: `Ajuste a documento ${parentNumber}`
    }
  });

  const lineNds = await request('/api/collections/purchase_invoice_lines/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      invoice_id: purNds.data.id,
      description: 'Anulación Reparación de cerraduras',
      qty: 1,
      unit_price: 80000,
      subtotal: 80000,
      total: 80000,
      iva_rate: 0,
      iva_amount: 0
    }
  });

  const emitNds = await request('/api/dian/emit', {
    method: 'POST',
    headers: authHeaders,
    body: { 
      txId: txNds.data.id, 
      isNotaAjusteDocSoporte: true,
      billing_reference: {
        number: parentNumber,
        uuid: parentCuds,
        date: checkPurPadre.data?.date?.slice(0, 10)
      }
    }
  });

  console.log(`   Respuesta emisión NDS: status ${emitNds.status}`, emitNds.data);

  // Verificar estado de la Nota de Ajuste
  const checkNdsPur = await request(`/api/collections/purchase_invoices/records/${purNds.data.id}`, { headers: authHeaders });
  console.log(`   NDS purchase_invoices: status_dian="${checkNdsPur.data?.status_dian}", cuds="${checkNdsPur.data?.cuds}"`);

  // Limpieza
  console.log('\n3. Limpieza de registros de prueba...');
  await request(`/api/collections/purchase_invoice_lines/records/${lineNds.data.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/purchase_invoices/records/${purNds.data.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/transactions/records/${txNds.data.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/purchase_invoice_lines/records/${linePadre.data.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/purchase_invoices/records/${purPadre.data.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/transactions/records/${txPadre.data.id}`, { method: 'DELETE', headers: authHeaders });
  await new Promise(r => db.run(`DELETE FROM einvoice_docs WHERE tx_id IN ('${txPadre.data.id}', '${txNds.data.id}')`, r));

  db.close();
  console.log('Prueba NDS finalizada con éxito.');
}

testNdsFlow().catch(console.error);
