const fs = require('fs');
const path = require('path');

const logDir = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/logs/dian';
const files = fs.readdirSync(logDir);
files.forEach(file => {
  if (file.endsWith('_log.txt')) {
    const content = fs.readFileSync(path.join(logDir, file), 'utf8');
    if (content.includes('parsedSuccess: true')) {
      console.log(`Success: ${file}`);
      // Find the last rawResponse or soapEnvelope and extract customer info
      const b64Matches = content.match(/<xmlBase64[^>]*>([^<]+)<\/xmlBase64>/g);
      if (b64Matches) {
        const lastB64 = b64Matches[b64Matches.length - 1].replace(/<xmlBase64[^>]*>|<\/xmlBase64>/g, '');
        const xml = Buffer.from(lastB64, 'base64').toString('utf8');
        const adqMatch = xml.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
        if (adqMatch) {
          console.log(adqMatch[0].split('\n').map(l => l.trim()).filter(l => l.startsWith('<ADQ_')).join('\n'));
        }
      }
    }
  }
});
