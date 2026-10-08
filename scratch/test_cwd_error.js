const { spawn } = require('child_process');
const path = require('path');

const pbExe = path.resolve('pocketbase.exe');
const pbData = path.resolve('pb_data');

const proc = spawn(pbExe, ['serve', '--http=127.0.0.1:8099', `--dir=${pbData}`], { cwd: 'C:\\' });
proc.stdout.on('data', d => console.log('STDOUT:', d.toString()));
proc.stderr.on('data', d => console.log('STDERR:', d.toString()));

setTimeout(() => {
  proc.kill();
  process.exit(0);
}, 3000);
