const fs = require('fs');
const path = require('path');

const logDir = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/logs/dian';
const files = fs.readdirSync(logDir);
files.forEach(file => {
  if (file.endsWith('_log.txt')) {
    const content = fs.readFileSync(path.join(logDir, file), 'utf8');
    const successMatch = content.match(/parsedSuccess:\s*(\w+)/);
    const codeMatch = content.match(/parsedCode:\s*(\d+)/);
    const msgMatch = content.match(/parsedMessage:\s*([^\n]+)/);
    if (successMatch || codeMatch) {
      console.log(`${file}: success=${successMatch ? successMatch[1] : 'N/A'}, code=${codeMatch ? codeMatch[1] : 'N/A'}`);
      if (msgMatch && msgMatch[1].trim() !== 'null') {
        console.log(`  Msg: ${msgMatch[1].substring(0, 100)}`);
      }
    }
  }
});
