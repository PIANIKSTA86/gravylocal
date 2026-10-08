const { spawn } = require('child_process');

const proc = spawn('./pocketbase.exe', ['serve', '--http=127.0.0.1:8099', '--dir=pb_data', '--hooksDir=pb_hooks'], { cwd: process.cwd() });
proc.stdout.on('data', d => console.log('STDOUT:', d.toString()));
proc.stderr.on('data', d => console.log('STDERR:', d.toString()));

setTimeout(() => {
  proc.kill();
  process.exit(0);
}, 3000);
