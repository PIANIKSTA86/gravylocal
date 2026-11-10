const fs = require('fs');
const transcriptPath = 'C:\\Users\\JULIAN\\.gemini\\antigravity\\brain\\f3c04642-4eac-425c-a251-f3047941ec87\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');

let pos = 0;
const matches = [];
while ((pos = content.indexOf('zy49bniamw9poof', pos + 1)) !== -1) {
  matches.push(pos);
}
console.log('Matches for zy49bniamw9poof:', matches);
matches.forEach((p, idx) => {
  console.log(`Match ${idx} around pos ${p}:`);
  console.log(content.slice(p - 50, p + 200));
});

