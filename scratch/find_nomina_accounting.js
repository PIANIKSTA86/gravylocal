const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_hooks';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const code = fs.readFileSync(path.join(dir, file), 'utf8');
    const matches = code.match(/onRecord\w+/g);
    if (matches) {
      console.log(`File ${file} has handlers: ${matches.join(', ')}`);
    }
  }
});
