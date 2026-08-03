const fs = require('fs');
const path = require('path');

const logDir = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/logs/dian';
const files = ['FV-00003753_log.txt', 'FV-00003754_log.txt', 'FV-00003755_log.txt'];
files.forEach(file => {
  const p = path.join(logDir, file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    console.log(`=== ${file} ===`);
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
});
