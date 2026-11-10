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
  if (lineNum === 2241) {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/step_2978_output.txt', obj.content);
    console.log('Saved step 2978 output, length:', obj.content.length);
  }
});

