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
  if (line.includes('read_full_employee_rules')) {
    console.log(`Line ${lineNum}: ${line.slice(0, 150)}`);
  }
});

