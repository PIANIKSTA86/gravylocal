const { execSync } = require('child_process');

const diff = execSync('git diff pb_hooks/dian.pb.js', { encoding: 'utf8' });
const lines = diff.split('\n');

for (let i = 0; i < Math.min(lines.length, 120); i++) {
  console.log(lines[i]);
}
