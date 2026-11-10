const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\JULIAN\\.gemini\\antigravity\\brain\\f3c04642-4eac-425c-a251-f3047941ec87\\.system_generated\\logs\\transcript_full.jsonl';
const rl = readline.createInterface({
  input: fs.createReadStream(transcriptPath),
  crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  if (lineNum === 846) {
    const obj = JSON.parse(line);
    console.log('Line 846 content:', obj.content ? obj.content.slice(0, 300) : 'none');
    fs.writeFileSync('scratch/line_846.txt', obj.content || '');
  }
});

