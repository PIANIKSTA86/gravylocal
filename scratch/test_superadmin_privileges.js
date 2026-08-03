const http = require('http');

function post(url, data, token = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    if (token) {
      options.headers['Authorization'] = token;
    }
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') });
      });
    });
    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Authorization': token
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') });
      });
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function run() {
  try {
    console.log("1. Authenticating against HUB (port 8089) as admin@contaco.com...");
    const loginRes = await post('http://127.0.0.1:8089/api/collections/hub_users/auth-with-password', {
      identity: 'admin@contaco.com',
      password: 'Admin1234!'
    });
    
    if (loginRes.statusCode !== 200) {
      console.error("Login to HUB failed:", loginRes.statusCode, loginRes.body);
      process.exit(1);
    }
    
    const token = loginRes.body.token;
    console.log("Login success! Token acquired.");

    console.log("\n2. Requesting company list from HUB (/api/hub/my-companies)...");
    const compRes = await get('http://127.0.0.1:8089/api/hub/my-companies', token);

    console.log("Response status:", compRes.statusCode);
    console.log("Response body:\n", JSON.stringify(compRes.body, null, 2));
    
  } catch (err) {
    console.error("Error during verification:", err);
    process.exit(1);
  }
}

run();
