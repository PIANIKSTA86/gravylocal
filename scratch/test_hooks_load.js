const { spawn } = require('child_process');
const http = require('http');

async function testWithWait(withHooks) {
  const args = ['serve', '--http=127.0.0.1:8099', '--dir=pb_data'];
  if (withHooks) args.push('--hooksDir=pb_hooks');
  
  const proc = spawn('./pocketbase.exe', args, { cwd: process.cwd() });
  
  // Wait until it prints "Server started at" or 8 seconds
  await new Promise((resolve) => {
    let done = false;
    proc.stdout.on('data', d => {
      const s = d.toString();
      if (s.includes('Server started at')) {
        if (!done) { done = true; resolve(); }
      }
    });
    setTimeout(() => {
      if (!done) { done = true; resolve(); }
    }, 8000);
  });
  
  return new Promise((resolve) => {
    const req = http.request('http://127.0.0.1:8099/api/tenant/auth-via-hub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ withHooks, statusCode: res.statusCode, body });
        proc.kill();
      });
    });
    req.on('error', (err) => {
      resolve({ withHooks, error: err.message });
      proc.kill();
    });
    req.write(JSON.stringify({ hub_token: 'test' }));
    req.end();
  });
}

(async () => {
  console.log('Testing WITHOUT hooksDir:');
  const r1 = await testWithWait(false);
  console.log('Result 1:', JSON.stringify(r1));

  console.log('\nTesting WITH hooksDir:');
  const r2 = await testWithWait(true);
  console.log('Result 2:', JSON.stringify(r2));
  process.exit(0);
})();
