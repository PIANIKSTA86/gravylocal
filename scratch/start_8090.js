const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sub = spawn(
  path.join(root, 'pocketbase.exe'),
  [
    'serve',
    '--http=0.0.0.0:8090',
    `--dir=${path.join(root, 'pb_data')}`,
    `--publicDir=${path.join(root, 'pb_public')}`,
    `--hooksDir=${path.join(root, 'pb_hooks')}`
  ],
  {
    detached: true,
    stdio: 'ignore',
    cwd: root
  }
);
sub.unref();
console.log('Spawned 8090 with PID', sub.pid);

