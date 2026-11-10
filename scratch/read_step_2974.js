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
  if (lineNum >= 2235 && lineNum <= 2237) {
    const obj = JSON.parse(line);
    console.log(`Line ${lineNum} step ${obj.step_index}:`, obj.content ? obj.content.slice(0, 300) : 'no content');
    if (obj.tool_calls) {
      console.log('Tool calls:', JSON.stringify(obj.tool_calls).slice(0, 300));
    }
  }
});

