const fetch = globalThis.fetch || require('node-fetch');

async function main() {
  try {
    console.log('Testing raw HTTP POST to PocketBase...');
    
    // Check if we can find a valid token or user
    // We can query PocketBase endpoint directly or test with valid payload
    const payload = {
      number: 'TEST-FV-' + Date.now(),
      customer_id: '89iwncs33camw8z',
      warehouse_id: '75npb0kfhhfdtmf',
      date: '2026-07-28',
      due_date: '2026-07-28',
      notes: 'Test invoice',
      payment_method: 'EFECTIVO',
      payment_form: '1',
      payment_dian_code: '10',
      subtotal: 100000,
      iva_total: 19000,
      total: 119000,
      payable_total: 119000,
      tx_type_id: 'hvxhp0kctv6oc5z',
      status: 'draft',
      is_electronic: true
    };

    const res = await fetch('http://localhost:8090/api/collections/invoices/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('STATUS:', res.status, res.statusText);
    const data = await res.json();
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

main();
