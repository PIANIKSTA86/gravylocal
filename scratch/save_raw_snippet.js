const fs = require('fs');

const transcriptPath = 'C:\\Users\\JULIAN\\.gemini\\antigravity\\brain\\f3c04642-4eac-425c-a251-f3047941ec87\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');

const start = 4443952;
const snippet = content.slice(start, start + 12000);
fs.writeFileSync('scratch/full_raw_snippet.txt', snippet);
console.log('Snippet saved, length:', snippet.length);

