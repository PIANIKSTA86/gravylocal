const { execSync, spawn } = require('child_process');
const path = require('path');

const portsToRestart = [8090, 8091, 8092, 8093, 8094];

function getPidsForPort(port) {
  try {
    const netstat = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = netstat.split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].includes(`:${port}`) && parts[3] === 'LISTENING') {
        const pid = parseInt(parts[4], 10);
        if (pid && pid > 0) pids.add(pid);
      }
    }
    return Array.from(pids);
  } catch (e) {
    return [];
  }
}

for (const port of portsToRestart) {
  const pids = getPidsForPort(port);
  console.log(`Port ${port} has PIDs:`, pids);
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`);
      console.log(`[+] Killed PID ${pid} on port ${port}`);
    } catch (e) {
      console.warn(`[-] Failed to kill PID ${pid}: ${e.message}`);
    }
  }

  // Small delay
  const startArgs = port === 8090 ? [
    'serve',
    `--http=0.0.0.0:${port}`,
    '--dir=pb_data',
    '--publicDir=pb_public',
    '--hooksDir=pb_hooks'
  ] : [
    'serve',
    `--http=0.0.0.0:${port}`,
    `--dir=empresas\\empresa_${port}\\pb_data`,
    '--publicDir=pb_public',
    `--hooksDir=empresas\\empresa_${port}\\pb_hooks`,
    '--migrationsDir=pb_migrations'
  ];

  const sub = spawn('pocketbase.exe', startArgs, {
    detached: true,
    stdio: 'ignore',
    cwd: path.resolve(__dirname, '..')
  });
  sub.unref();
  console.log(`[OK] Inició PocketBase en puerto ${port} (PID ${sub.pid})`);
}

console.log("[DONE] Todos los servicios de empresa han sido reiniciados.");

