const fs = require('fs');
const path = require('path');

const logDir = 'logs/dian';
if (fs.existsSync(logDir)) {
  const files = fs.readdirSync(logDir).filter(f => f.endsWith('_log.txt'));
  files.forEach(file => {
    const filePath = path.join(logDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/parsedMessage:\s*(.*)/g);
    if (matches) {
      console.log(`=== ${file} ===`);
      matches.forEach(m => console.log(m));
    }
  });
}
