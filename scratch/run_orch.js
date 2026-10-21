const { spawn } = require('child_process');

const child = spawn('node', ['hub/orchestrator.js'], {
  stdio: 'inherit',
  cwd: __dirname + '/..'
});

child.on('exit', (code, signal) => {
  console.log(`[ORCH EXIT] Child exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('[ORCH ERROR]', err);
});
