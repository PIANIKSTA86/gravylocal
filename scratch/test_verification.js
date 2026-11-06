const http = require('http');

function postJson(port, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (_) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (_) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Authenticating as admin@contaco.com on port 8092 ---');
  let auth = await postJson(8092, '/api/collections/users/auth-with-password', {
    identity: 'admin@contaco.com',
    password: '123456789'
  });

  if (!auth.data || !auth.data.token) {
    console.log('User auth failed, trying julian_piano@hotmail.com or admin@gravy.com...');
    auth = await postJson(8092, '/api/collections/users/auth-with-password', {
      identity: 'admin@gravy.com',
      password: '123456789'
    });
  }

  const token = auth.data ? auth.data.token : null;
  console.log('Auth status:', auth.status, token ? 'Token obtained!' : 'No token');

  if (!token) {
    console.error('Failed to authenticate:', auth);
    return;
  }

  const authHeader = { 'Authorization': token };

  console.log('\n--- 2. Testing GET /api/dian/logs?tx_id=cni9njlt5wvhoqb&limit=10 ---');
  const logsRes = await getJson(8092, '/api/dian/logs?tx_id=cni9njlt5wvhoqb&limit=10', authHeader);
  console.log('Logs response status:', logsRes.status);
  console.log('Logs data:', JSON.stringify(logsRes.data || logsRes.raw, null, 2));

  console.log('\n--- 3. Testing POST /api/dian/emit with dryRun: true (NO DIAN EMISSION) ---');
  const emitRes = await postJson(8092, '/api/dian/emit', {
    txId: 'cni9njlt5wvhoqb',
    dryRun: true
  }, authHeader);
  console.log('Emit dryRun status:', emitRes.status);
  console.log('Emit dryRun response:', JSON.stringify(emitRes.data || emitRes.raw, null, 2));
}

run().catch(console.error);

