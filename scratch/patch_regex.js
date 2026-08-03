const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

const target = '/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\\s[^>]?>)?([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i';
const replacement = '/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("SUCCESS: Regex patched in orchestrator.js!");
} else {
  console.error("ERROR: Regex target not found in orchestrator.js!");
}
