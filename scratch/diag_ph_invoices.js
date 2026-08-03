const fetch = globalThis.fetch || require('node-fetch');

async function testCreateInvoice() {
  console.log('Testing connection to http://localhost:8090...');
  
  // First list collections or ph_properties to get a valid property_id
  try {
    const propRes = await fetch('http://localhost:8090/api/collections/ph_properties/records?perPage=1');
    const propData = await propRes.json();
    console.log('Sample property:', propData.items && propData.items[0] ? propData.items[0].id : 'None');
    
    const propId = (propData.items && propData.items[0]) ? propData.items[0].id : 'dtqcf58j5jy3hq6';

    const res = await fetch('http://localhost:8090/api/collections/ph_invoices/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: 'TEST-DIAG-' + Date.now(),
        period: '2026-07',
        property_id: propId,
        date: '2026-07-01',
        due_date: '2026-07-10',
        subtotal: 100000,
        total: 100000,
        status: 'draft',
        notes: ''
      })
    });

    console.log('STATUS:', res.status, res.statusText);
    const json = await res.json();
    console.log('RESPONSE JSON:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

testCreateInvoice();
