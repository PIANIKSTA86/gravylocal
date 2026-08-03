const fs = require('fs');
const path = require('path');

const logFile = 'logs/dian/FV-00003749_log.txt';
if (fs.existsSync(logFile)) {
  const content = fs.readFileSync(logFile, 'utf8');
  const blocks = content.split('==================================================');
  const lastBlock = blocks[blocks.length - 1];
  
  const tsMatch = lastBlock.match(/TIMESTAMP:\s*(.*)/);
  const ts = tsMatch ? tsMatch[1] : 'Unknown';
  console.log(`=== LATEST ATTEMPT TIMESTAMP: ${ts} ===`);
  
  const msgMatch = lastBlock.match(/parsedMessage:\s*(.*)/g);
  if (msgMatch) {
    msgMatch.forEach(m => console.log(m));
  }
  
  const xmlMatch = lastBlock.match(/<xmlBase64[^>]*>(.*?)<\/xmlBase64>/);
  if (xmlMatch) {
    const decoded = Buffer.from(xmlMatch[1], 'base64').toString('utf8');
    console.log("--- DECODED XML CONTENT ---");
    console.log(decoded);
  } else {
    console.log("No XML found in last block.");
  }
} else {
  console.log("Log file not found.");
}
