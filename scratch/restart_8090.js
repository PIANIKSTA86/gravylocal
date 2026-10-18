const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('Stopping process on port 8090...');
try {
  const findCmd = 'powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue).OwningProcess"';
  const pidOut = execSync(findCmd, { encoding: 'utf8' }).trim();
  if (pidOut) {
    const pids = pidOut.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    for (const p of pids) {
      console.log('Killing PID:', p);
      try { process.kill(parseInt(p, 10), 'SIGKILL'); } catch (_) {}
    }
  } else {
    console.log('No process found on port 8090.');
  }
} catch (e) {
  console.log('Notice stopping 8090:', e.message);
}

// Wait 1 second
setTimeout(() => {
  console.log('Starting PocketBase on 8090...');
  const root = path.resolve(__dirname, '..');
  const pbExe = path.join(root, 'pocketbase.exe');
  
  const pb = spawn(pbExe, [
    'serve',
    '--http=0.0.0.0:8090',
    `--dir=${path.join(root, 'pb_data')}`,
    `--publicDir=${path.join(root, 'pb_public')}`,
    `--hooksDir=${path.join(root, 'pb_hooks')}`
  ], {
    detached: true,
    stdio: 'ignore'
  });
  pb.unref();

  console.log('PocketBase restarted with PID:', pb.pid);
  setTimeout(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8090/api/health');
      console.log('Health check after restart:', res.status);
    } catch (err) {
      console.log('Health check error:', err.message);
    }
  }, 2000);
}, 1000);
