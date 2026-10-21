const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function testPutSoftware() {
  const getSetting = (k) => new Promise((res) => db.get("SELECT value FROM settings WHERE key = ?", [k], (_, r) => res(r ? r.value : null)));
  const token = await getSetting('matias_api_token');
  const clientUuid = await getSetting('matias_client_uuid');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  let url = `${baseUrl}/software/4765?client_uuid=${encodeURIComponent(clientUuid)}`;
  
  // Try sending PUT to see if software can be updated
  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      records: JSON.stringify({
        environment_id: 1,
        pin: '36393',
        identification: '01c36b9e-8466-4a05-a059-d7ab2c1fa0d2',
        url: 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc?wsdl'
      })
    })
  });

  console.log('Status PUT /software/4765:', resp.status);
  const json = await resp.json();
  console.log('Response PUT:', json);
  db.close();
}

testPutSoftware();
