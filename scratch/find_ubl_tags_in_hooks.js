const fs = require('fs');
const content = fs.readFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_hooks/dian.pb.js', 'utf8');

const regex = /<cac:[A-Za-z0-9]+/g;
const tags = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  tags.add(match[0]);
}
console.log("FOUND UBL TAGS IN dian.pb.js:");
console.log(Array.from(tags).sort());
