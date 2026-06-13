const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, '..', 'pb_data', 'types.d.ts');
const content = fs.readFileSync(typesPath, 'utf8');

function findMatches(pattern) {
  const regex = new RegExp(pattern, 'gi');
  let match;
  console.log(`\n--- Matches for: ${pattern} ---`);
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
    if (count > 20) {
      console.log("... truncated");
      break;
    }
    const start = Math.max(0, match.index - 150);
    const end = Math.min(content.length, match.index + match[0].length + 150);
    console.log(`[${match.index}]: ... ${content.substring(start, end).replace(/\r?\n/g, ' ')} ...`);
  }
}

findMatches('newFileFromBytes');
findMatches('fileFromBytes');
