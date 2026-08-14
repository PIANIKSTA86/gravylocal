const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.resolve('pb_hooks');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pb.js'));

let errors = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    new vm.Script(code);
  } catch (e) {
    console.error(`SYNTAX ERROR in ${file}:`, e.message);
    errors++;
  }
}

if (errors === 0) {
  console.log(`ALL ${files.length} .pb.js files are syntactically valid!`);
}
