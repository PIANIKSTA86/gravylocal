const fs = require('fs');

let content = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');

// Replace the two occurrences of "if (adq1 === '2' && adq3 !== '31') {" with "if (adq1 === '2' && adq3 !== '31' && custDocNum !== '222222222222') {"
const lines = content.split(/\r?\n/);
let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "if (adq1 === '2' && adq3 !== '31') {") {
    lines[i] = lines[i].replace("if (adq1 === '2' && adq3 !== '31') {", "if (adq1 === '2' && adq3 !== '31' && custDocNum !== '222222222222') {");
    count++;
  }
}

if (count === 2) {
  fs.writeFileSync('pb_hooks/dian.pb.js', lines.join('\r\n'), 'utf8');
  console.log("Successfully replaced name condition for NIT and Consumidor Final!");
} else {
  console.log(`Error: Found ${count} occurrences instead of 2.`);
}
