const fs = require('fs');
const content = fs.readFileSync('logs/dian/FV-00003749_log.txt', 'utf8');

const blocks = content.split('==================================================');
blocks.forEach((block, idx) => {
  if (block.includes('TIMESTAMP:')) {
    const tsMatch = block.match(/TIMESTAMP:\s*(.*)/);
    const ts = tsMatch ? tsMatch[1] : 'Unknown';
    const msgMatch = block.match(/parsedMessage:\s*(.*)/);
    const msg = msgMatch ? msgMatch[1] : 'No message';
    console.log(`Block ${idx}: Timestamp=${ts}, Message=${msg}`);
  }
});
