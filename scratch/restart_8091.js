const { execSync } = require('child_process');

console.log('Finding and killing process on port 8091...');
try {
  const netstat = execSync('netstat -ano | findstr :8091', { encoding: 'utf8' });
  const lines = netstat.trim().split('\n');
  const pids = new Set();
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1].includes(':8091') && parts[3] === 'LISTENING') {
      pids.add(parts[4]);
    }
  });
  pids.forEach(pid => {
    console.log('Killing PID:', pid);
    try { execSync(`taskkill /PID ${pid} /F`); } catch (_) {}
  });
} catch (e) {
  console.log('Notice finding PID on 8091:', e.message);
}

setTimeout(async () => {
  console.log('Asking orchestrator to ensure 8091 is alive...');
  try {
    const res = await fetch('http://127.0.0.1:8088/api/orchestrate/ensure/8091');
    const data = await res.json();
    console.log('Orchestrator ensure response:', data);
  } catch (err) {
    console.error('Orchestrator ensure failed:', err.message);
  }
  
  setTimeout(async () => {
    try {
      const h = await fetch('http://127.0.0.1:8091/api/health');
      console.log('8091 health check:', h.status);
    } catch (err) {
      console.error('8091 not up yet:', err.message);
    }
  }, 3000);
}, 1500);
