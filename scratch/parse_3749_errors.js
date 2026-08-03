const fs = require('fs');

const log = fs.readFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/logs/dian/FV-00003749_log.txt', 'utf8');
const regex = /TIMESTAMP: ([^\n]+)[\s\S]*?rawResponse: ([\s\S]*?)parsedSuccess/g;
let match;
let count = 1;
while ((match = regex.exec(log)) !== null) {
  const timestamp = match[1];
  const response = match[2];
  const errMatch = response.match(/<error xsi:type="xsd:string">([\s\S]*?)<\/error>/);
  console.log(`Attempt ${count} (${timestamp}):`);
  if (errMatch) {
    console.log(`  Error: ${errMatch[1]}`);
  } else {
    console.log(`  Raw Response: ${response.substring(0, 200)}...`);
  }
  count++;
}
