const fs = require('fs');

const code = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
const lines = code.split('\n');

console.log("Lines 2940-2975:");
console.log(lines.slice(2939, 2975).join('\n'));

console.log("\nLines 3350-3400:");
console.log(lines.slice(3349, 3400).join('\n'));

