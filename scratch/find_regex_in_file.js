const fs = require('fs');
const content = fs.readFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js', 'utf8');

const regex = /LineExtensionAmount/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 50);
  const end = Math.min(content.length, match.index + 150);
  console.log(`Match at index ${match.index}:`);
  console.log(content.substring(start, end));
  console.log("------------------------");
}
