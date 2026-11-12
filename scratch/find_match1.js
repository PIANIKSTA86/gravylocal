const fs = require('fs');
const str = fs.readFileSync('scratch/matias_docs.json', 'utf8');

const idx = str.indexOf('"period": {\n                                            "type": "string"');
if (idx !== -1) {
  console.log(str.substring(idx - 600, idx + 400));
} else {
  const idx2 = str.indexOf('"period"');
  console.log(str.substring(idx2 - 400, idx2 + 400));
}

