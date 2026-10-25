const fs = require('fs');
const content = fs.readFileSync('pb_data/types.d.ts', 'utf-8');
const idx = content.indexOf('interface RecordAuthWithPasswordRequestEvent');
if (idx >= 0) {
  console.log(content.slice(idx - 50, idx + 600));
}
