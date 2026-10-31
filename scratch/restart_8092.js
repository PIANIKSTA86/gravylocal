const { execSync, spawn } = require('child_process');
const path = require('path');

try {
  execSync('taskkill /F /PID 15924');
  console.log('Killed PID 15924');
} catch (e) {
  console.log('Kill err:', e.message);
}

// Find any other pid on 8092
try {
  const netstat = execSync('netstat -ano | findstr :8092', { encoding: 'utf8' });
  for (const line of netstat.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1].includes(':8092') && parts[3] === 'LISTENING') {
      const pid = parseInt(parts[4], 10);
      if (pid && pid > 0) {
        try { execSync(`taskkill /F /PID ${pid}`); } catch (_) {}
      }
    }
  }
} catch (_) {}

const root = path.resolve(__dirname, '..');
const sub = spawn(
  path.join(root, 'pocketbase.exe'),
  [
    'serve',
    '--http=0.0.0.0:8092',
    `--dir=${path.join(root, 'empresas', 'empresa_8092', 'pb_data')}`,
    `--publicDir=${path.join(root, 'pb_public')}`,
    `--hooksDir=${path.join(root, 'empresas', 'empresa_8092', 'pb_hooks')}`,
    '--migrationsDir=pb_migrations'
  ],
  {
    detached: true,
    stdio: 'ignore',
    cwd: root
  }
);
sub.unref();
console.log('Spawned 8092 with PID', sub.pid);
