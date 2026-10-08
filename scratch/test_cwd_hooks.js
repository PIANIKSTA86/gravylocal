const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const pbExe = path.resolve('pocketbase.exe');
const pbData = path.resolve('pb_data');

// Start pocketbase with cwd set to os temp or system32, and NO absolute --hooksDir
const proc = spawn(pbExe, ['serve', '--http=127.0.0.1:8099', `--dir=${pbData}`], { cwd: 'C:\\' });

setTimeout(() => {
  const req = http.request('http://127.0.0.1:8099/api/tenant/auth-via-hub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    console.log('STATUS CODE WHEN CWD != project root and no hooksDir:', res.statusCode);
    proc.kill();
    process.exit(0);
  });
  req.on('error', (err) => {
    console.log('Error:', err.message);
    proc.kill();
    process.exit(1);
  });
  req.write(JSON.stringify({ hub_token: 'test' }));
  req.end();
}, 2500);
