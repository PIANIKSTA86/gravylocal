const fs = require('fs');
const path = require('path');

const logFile = 'logs/dian/FV-00003748_log.txt';
if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  const xmlMatches = [...content.matchAll(/<xmlBase64[^>]*>(.*?)<\/xmlBase64>/g)];
  if (xmlMatches.length > 0) {
    const lastXmlBase64 = xmlMatches[xmlMatches.length - 1][1];
    const decoded = Buffer.from(lastXmlBase64, 'base64').toString('utf8');
    
    console.log("--- ADQ Block in FV-00003748 ---");
    const adqMatch = decoded.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
    if (adqMatch) {
      console.log(adqMatch[1].trim());
    }
  }
}
