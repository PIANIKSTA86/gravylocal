const { execSync } = require('child_process');

try {
  const netstat = execSync('netstat -ano | findstr :8088 | findstr LISTENING', { encoding: 'utf8' });
  const match = netstat.match(/LISTENING\s+(\d+)/);
  if (match) {
    const pid = match[1];
    console.log(`Terminating old orchestrator PID ${pid} via WMI...`);
    const res = execSync(`powershell -Command "(Get-WmiObject Win32_Process -Filter 'ProcessId=${pid}').Terminate()"`, { encoding: 'utf8' });
    console.log('Terminate result:', res);
  }
} catch (e) {
  console.log('Error:', e.message);
}
