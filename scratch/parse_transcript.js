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
      if (obj.step_index === 220) {
        fs.writeFileSync('C:\\Users\\JULIAN\\Desktop\\GravyLocal2.0\\scratch\\subagent_220.txt', obj.content);
        console.log("Saved content to subagent_220.txt");
        return;
      }
    } catch(e) {
      // ignore
    }
  }
}
run();
