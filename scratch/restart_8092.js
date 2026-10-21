const { execSync } = require('child_process');
const http = require('http');

try {
  const netstat = execSync('netstat -ano | findstr :8092 | findstr LISTENING', { encoding: 'utf8' });
  const match = netstat.match(/LISTENING\s+(\d+)/);
  if (match) {
    const pid = match[1];
    console.log(`Killing PID ${pid} via WMI...`);
    try {
      execSync(`powershell -Command "(Get-WmiObject Win32_Process -Filter 'ProcessId=${pid}').Terminate()"`);
      console.log('Terminated via WMI');
    } catch (e) {
      console.log('WMI terminate failed:', e.message);
    }
  }
} catch (e) {
  console.log('No process on 8092 found or error:', e.message);
}

setTimeout(() => {
  console.log('Triggering orchestrator ensure 8092...');
  http.get('http://127.0.0.1:8088/api/orchestrate/ensure/8092', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Ensure response:', data);
    });
  }).on('error', err => console.error('Ensure error:', err));
}, 2000);
