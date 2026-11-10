const fs = require('fs');
const transcriptPath = 'C:\\Users\\JULIAN\\.gemini\\antigravity\\brain\\f3c04642-4eac-425c-a251-f3047941ec87\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');

const start = 4069100;
const end = content.indexOf('Command exited with code', start);
console.log('Snippet length:', end - start);
fs.writeFileSync('scratch/match4.txt', content.slice(start, end));

