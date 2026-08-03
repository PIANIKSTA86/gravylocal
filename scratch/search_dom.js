const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\eb39ed69-19a1-4e62-973e-6df0e5d77370\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      // Look for the DOM results returned to the browser agent
      if (obj.type === 'CODE_ACTION' && obj.content && obj.content.includes('po-prod-search-global')) {
        console.log(`=== DOM CONTAINING SEARCH INPUT AT STEP ${obj.step_index} ===`);
        // Find occurrence of po-prod-search-global and print 500 chars around it
        const idx = obj.content.indexOf('po-prod-search-global');
        if (idx !== -1) {
          console.log(obj.content.substring(idx - 200, idx + 800));
        }
      }
    } catch(e) {
      // ignore
    }
  }
}
run();
