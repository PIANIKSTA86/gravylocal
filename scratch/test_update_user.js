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

function patch(url, data, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
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
    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    console.log("1. Authenticating as admin@contaco.com...");
    const loginRes = await post('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      identity: 'admin@contaco.com',
      password: 'Admin1234!'
    });
    
    if (loginRes.statusCode !== 200) {
      console.error("Login failed:", loginRes.statusCode, loginRes.body);
      process.exit(1);
    }
    
    const token = loginRes.body.token;
    console.log("Login success! Token acquired.");

    console.log("\n2. Patching user g75s4kw5c24i1ff role to 'cajero'...");
    const patchRes1 = await patch('http://127.0.0.1:8090/api/collections/users/records/g75s4kw5c24i1ff', {
      role: 'cajero'
    }, token);

    console.log("Response status:", patchRes1.statusCode);
    console.log("Response body:", JSON.stringify(patchRes1.body, null, 2));

    if (patchRes1.statusCode === 200) {
      console.log("SUCCESS: User role updated to 'cajero' successfully!");
      
      console.log("\n3. Reverting user role back to 'auxiliar'...");
      const patchRes2 = await patch('http://127.0.0.1:8090/api/collections/users/records/g75s4kw5c24i1ff', {
        role: 'auxiliar'
      }, token);
      console.log("Revert response status:", patchRes2.statusCode);
      if (patchRes2.statusCode === 200) {
        console.log("SUCCESS: Reverted user role back to 'auxiliar' successfully!");
      } else {
        console.error("FAILED to revert user role:", patchRes2.body);
      }
    } else {
      console.error("FAILED to update user role to 'cajero'.");
      process.exit(1);
    }
  } catch (err) {
    console.error("Error during execution:", err);
    process.exit(1);
  }
}

run();
