const { execSync, spawn } = require('child_process');

try {
  // Find processes on port 8094
  const netstat = execSync('netstat -ano | findstr :8094', { encoding: 'utf8' });
  const lines = netstat.split('\n');
  const pids = new Set();
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1].includes(':8094')) {
      const pid = parseInt(parts[4], 10);
      if (pid && pid > 0) pids.add(pid);
    }
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`);
      console.log(`Killed PID ${pid}`);
    } catch (_) {}
  }
} catch (e) {
  console.log('No process on 8094 found or killed');
}

// Start pocketbase on 8094
const sub = spawn(
  'pocketbase.exe',
  [
    'serve',
    '--http=127.0.0.1:8094',
    '--dir=empresas\\empresa_8094\\pb_data',
    '--publicDir=pb_public',
    '--hooksDir=empresas\\empresa_8094\\pb_hooks',
    '--migrationsDir=pb_migrations'
  ],
  {
    detached: true,
    stdio: 'ignore'
  }
);
sub.unref();
console.log('Spawned PocketBase with PID', sub.pid);

