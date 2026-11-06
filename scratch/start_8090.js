const { spawn } = require('child_process');
const path = require('path');
const root = process.cwd();
const pbExe = path.join(root, 'pocketbase.exe');
const sub = spawn(pbExe, [
  'serve',
  '--http=0.0.0.0:8090',
  '--dir=' + path.join(root, 'pb_data'),
  '--publicDir=' + path.join(root, 'pb_public'),
  '--hooksDir=' + path.join(root, 'pb_hooks'),
  '--migrationsDir=pb_migrations'
], {
  detached: true,
  stdio: 'ignore',
  cwd: root
});
sub.unref();
console.log('Started 8090 with PID:', sub.pid);
