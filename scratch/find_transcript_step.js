const fs = require('fs');
const readline = require('readline');
const { DatabaseSync } = require('node:sqlite');

const transcriptPath = 'C:\\Users\\JULIAN\\.gemini\\antigravity\\brain\\f3c04642-4eac-425c-a251-f3047941ec87\\.system_generated\\logs\\transcript_full.jsonl';

// Let's find step 2975 or 2977 where the script read employeeRules
const rl = readline.createInterface({
  input: fs.createReadStream(transcriptPath),
  crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  if (line.includes('"step_index":2975') || line.includes('"step_index":2974')) {
    console.log(`Line ${lineNum}: ${line.slice(0, 200)}...`);
  }
});

