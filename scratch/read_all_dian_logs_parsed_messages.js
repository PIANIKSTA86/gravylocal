const fs = require('fs');
const path = require('path');

const logDir = 'logs/dian';
if (fs.existsSync(logDir)) {
  const files = fs.readdirSync(logDir).filter(f => f.endsWith('_log.txt'));
  files.forEach(file => {
    const content = fs.readFileSync(path.join(logDir, file), 'utf8');
    if (content.includes('CDG01') || content.includes('FAJ17')) {
      console.log(`\n========================================`);
      console.log(`FOUND MATCH IN: ${file}`);
      console.log(`========================================`);
      
      const parserMatches = content.match(/parsedMessage:\s*(.*)/g);
      if (parserMatches) {
        parserMatches.forEach(m => console.log(m));
      }
      
      // Extract the last XML block in base64
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
    }
  });
} else {
  console.log("Log directory does not exist.");
}
