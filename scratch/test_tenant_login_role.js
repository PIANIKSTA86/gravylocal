const http = require('http');

function post(url, data) {
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

async function run() {
  try {
    console.log("Authenticating against Tenant DB (port 8091) as admin@contaco.com...");
    const loginRes = await post('http://127.0.0.1:8091/api/collections/users/auth-with-password', {
      identity: 'admin@contaco.com',
      password: 'Admin1234!'
    });
    
    console.log("Response status:", loginRes.statusCode);
    if (loginRes.statusCode === 200) {
      console.log("User record from Tenant 8091:");
      console.log(JSON.stringify(loginRes.body.record, null, 2));
    } else {
      console.error("Login failed:", loginRes.body);
    }
  } catch (err) {
    console.error("Error during tenant login test:", err);
  }
}

run();
