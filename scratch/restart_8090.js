const { execSync, spawn } = require('child_process');
const path = require('path');

// 1. Kill any process listening on 8090
try {
  const netstat = execSync('netstat -ano | findstr :8090', { encoding: 'utf8' });
  for (const line of netstat.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1].includes(':8090') && parts[3] === 'LISTENING') {
      const pid = parseInt(parts[4], 10);
      if (pid && pid > 0) {
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`Killed PID ${pid} on port 8090`);
        } catch (_) {}
      }
    }
  }
} catch (err) {
  console.log('Netstat error:', err.message);
}

// 2. Wait 1 second
execSync('powershell -Command "Start-Sleep -Seconds 1"');

// 3. Start 8090
const root = path.resolve(__dirname, '..');
const sub = spawn(
  path.join(root, 'pocketbase.exe'),
  [
    'serve',
    '--http=127.0.0.1:8090',
    `--dir=${path.join(root, 'pb_data')}`,
    `--publicDir=${path.join(root, 'pb_public')}`,
    `--hooksDir=${path.join(root, 'pb_hooks')}`
  ],
  {
    detached: true,
    stdio: 'ignore',
    cwd: root
  }
);
sub.unref();
console.log('Spawned PocketBase 8090 with PID', sub.pid);
