const { execSync } = require('child_process');

const diff = execSync('git diff pb_hooks/dian.pb.js', { encoding: 'utf8' });
const lines = diff.split('\n');

console.log('Total diff lines:', lines.length);

let chunkHeader = '';
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith('@@')) {
    chunkHeader = l;
    console.log('\n' + chunkHeader);
  } else if (l.startsWith('+') || l.startsWith('-')) {
    if (!l.startsWith('+++') && !l.startsWith('---')) {
      console.log(l);
    }
  }
}
