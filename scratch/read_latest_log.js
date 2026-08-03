const fs = require('fs');
const path = require('path');

const logDir = 'logs/dian';
if (fs.existsSync(logDir)) {
  const files = fs.readdirSync(logDir)
    .filter(f => f.endsWith('_log.txt'))
    .map(f => ({ name: f, time: fs.statSync(path.join(logDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);
    
  if (files.length > 0) {
    const latestFile = files[0].name;
    const content = fs.readFileSync(path.join(logDir, latestFile), 'utf8');
    console.log(`=== LATEST LOG: ${latestFile} ===`);
    
    // Print parsedMessage
    const msgMatches = content.match(/parsedMessage:\s*(.*)/g);
    if (msgMatches) {
      msgMatches.forEach(m => console.log(m));
    }
    
    // Find XML content and decode if base64 or show if raw
    const xmlMatch = content.match(/<xmlBase64[^>]*>(.*?)<\/xmlBase64>/);
    if (xmlMatch) {
      const decoded = Buffer.from(xmlMatch[1], 'base64').toString('utf8');
      
      // Print EMI and ADQ blocks
      const emiMatch = decoded.match(/<EMI>([\s\S]*?)<\/EMI>/);
      const adqMatch = decoded.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
      
      if (emiMatch) {
        console.log("--- EMI BLOCK ---");
        console.log(emiMatch[1].trim());
      }
      if (adqMatch) {
        console.log("--- ADQ BLOCK ---");
        console.log(adqMatch[1].trim());
      }
    }
  } else {
    console.log("No log files found.");
  }
}
