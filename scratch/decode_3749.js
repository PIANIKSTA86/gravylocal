const fs = require('fs');

const log = fs.readFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/logs/dian/FV-00003749_log.txt', 'utf8');
const base64Matches = log.match(/<xmlBase64[^>]*>([^<]+)<\/xmlBase64>/g);
if (base64Matches) {
  base64Matches.forEach((m, i) => {
    const b64 = m.replace(/<xmlBase64[^>]*>|<\/xmlBase64>/g, '');
    fs.writeFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/scratch/decoded_xml_49_' + (i+1) + '.xml', Buffer.from(b64, 'base64').toString('utf8'));
  });
  console.log('Decoded ' + base64Matches.length + ' XML files from 3749.');
} else {
  console.log('No base64 XML found in 3749 log.');
}
