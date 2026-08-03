const fs = require('fs');

const content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const matches = content.match(/<ADQ_\d+>/g);
if (matches) {
  const unique = [...new Set(matches)];
  console.log("Unique ADQ tags:", unique.sort());
} else {
  console.log("No ADQ tags found.");
}
