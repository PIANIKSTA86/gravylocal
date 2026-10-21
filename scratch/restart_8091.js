const { execSync } = require('child_process');
const http = require('http');

console.log('Killing old PocketBase process 6388...');
try {
  execSync('taskkill /PID 6388 /F');
  console.log('Process 6388 killed.');
} catch (e) {
  console.log('Error or process already dead:', e.message);
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
  
  // Wait 3 seconds for startup
  setTimeout(async () => {
    try {
      const h = await fetch('http://127.0.0.1:8091/api/health');
      console.log('8091 health check:', h.status);
    } catch (err) {
      console.error('8091 not up yet:', err.message);
    }
  }, 3000);
}, 2000);
