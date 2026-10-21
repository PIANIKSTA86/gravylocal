const { execSync } = require('child_process');

try {
  const netstat = execSync('netstat -ano | findstr :8088 | findstr LISTENING', { encoding: 'utf8' });
  const match = netstat.match(/LISTENING\s+(\d+)/);
  if (match) {
    const pid = match[1];
    console.log(`Killing old orchestrator PID ${pid}...`);
    try {
      execSync(`powershell -Command "Stop-Process -Id ${pid} -Force"`);
    } catch (e) {
      console.log('Stop-Process error:', e.message);
    }
  }
} catch (e) {
  console.log('Port 8088 was not listening:', e.message);
}
