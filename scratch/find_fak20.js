const fs = require('fs');
const path = require('path');

const logDir = 'logs/dian';
if (fs.existsSync(logDir)) {
  const files = fs.readdirSync(logDir)
    .filter(f => f.endsWith('_log.txt'))
    .map(f => ({ name: f, time: fs.statSync(path.join(logDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
    
  let found = false;
  for (const fileObj of files) {
    const file = fileObj.name;
    const content = fs.readFileSync(path.join(logDir, file), 'utf8');
    if (content.includes('FAK20')) {
      console.log(`\n=== FOUND FAK20 IN: ${file} (modified ${new Date(fileObj.time).toLocaleString()}) ===`);
      const parserMatches = content.match(/parsedMessage:\s*(.*)/g);
      if (parserMatches) {
        parserMatches.forEach(m => console.log(m));
      }
      
      const xmlMatches = [...content.matchAll(/<xmlBase64[^>]*>(.*?)<\/xmlBase64>/g)];
      if (xmlMatches.length > 0) {
        const lastXmlBase64 = xmlMatches[xmlMatches.length - 1][1];
        const decoded = Buffer.from(lastXmlBase64, 'base64').toString('utf8');
        
        const emiMatch = decoded.match(/<EMI>([\s\S]*?)<\/EMI>/);
        const adqMatch = decoded.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
        
        if (emiMatch) {
          console.log("--- LAST EMI BLOCK ---");
          console.log(emiMatch[1].trim());
        }
        if (adqMatch) {
          console.log("--- LAST ADQ BLOCK ---");
          console.log(adqMatch[1].trim());
        }
      }
      found = true;
      break;
    }
  }
  if (!found) console.log("No logs containing FAK20 found.");
} else {
  console.log("Log directory does not exist.");
}
