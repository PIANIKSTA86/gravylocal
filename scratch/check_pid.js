const { execSync } = require('child_process');
const out = execSync('netstat -ano | findstr :8092', { encoding: 'utf8' });
console.log(out);
