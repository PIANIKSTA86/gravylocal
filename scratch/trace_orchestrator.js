const { spawn } = require('child_process');

console.log('Starting node with trace-exit...');
const child = spawn('node', ['--trace-exit', '--trace-uncaught', 'hub/orchestrator.js'], {
  cwd: __dirname + '/..'
});

child.stdout.on('data', d => process.stdout.write(d));
child.stderr.on('data', d => process.stderr.write(d));

child.on('exit', (code, sig) => {
  console.log(`\n=== PROCESS EXITED: code=${code}, signal=${sig} ===`);
  process.exit(code || 0);
});
