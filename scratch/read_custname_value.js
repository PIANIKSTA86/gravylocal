const fs = require('fs');
const content = fs.readFileSync('logs/dian/FV-00003749_log.txt', 'utf8');

const blocks = content.split('==================================================');
const lastBlock = blocks[blocks.length - 1];

const xmlMatch = lastBlock.match(/<xmlBase64[^>]*>(.*?)<\/xmlBase64>/);
if (xmlMatch) {
  const decoded = Buffer.from(xmlMatch[1], 'base64').toString('utf8');
  console.log("--- XML ---");
  const adqMatch = decoded.match(/<ADQ>([\s\S]*?)<\/ADQ>/);
  if (adqMatch) {
    console.log(adqMatch[1].trim());
  }
}
