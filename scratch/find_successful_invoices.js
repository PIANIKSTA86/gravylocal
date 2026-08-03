const fs = require('fs');
const path = require('path');

const logDir = 'logs/dian';
if (fs.existsSync(logDir)) {
  const files = fs.readdirSync(logDir).filter(f => f.endsWith('_log.txt'));
  files.forEach(file => {
    const content = fs.readFileSync(path.join(logDir, file), 'utf8');
    if (content.includes('authorized') || content.includes('autorizado') || content.includes('SIGNED_XML')) {
      console.log(`Successful log: ${file}`);
    }
  });
}
