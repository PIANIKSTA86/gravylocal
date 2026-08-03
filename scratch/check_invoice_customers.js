const fs = require('fs');
const path = require('path');

const logDir = 'logs/dian';
const files = ['FV-00003753_log.txt', 'FV-00003754_log.txt', 'FV-00003755_log.txt'];

files.forEach(file => {
  const filePath = path.join(logDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const xmlMatches = [...content.matchAll(/<xmlBase64[^>]*>(.*?)<\/xmlBase64>/g)];
    if (xmlMatches.length > 0) {
      const lastXmlBase64 = xmlMatches[xmlMatches.length - 1][1];
      const decoded = Buffer.from(lastXmlBase64, 'base64').toString('utf8');
      
      console.log(`=== ${file} ===`);
      const adqMatch = decoded.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
      if (adqMatch) {
        console.log(adqMatch[1].trim());
      }
    }
  }
});
