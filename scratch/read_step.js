const fs = require('fs');
const lines = fs.readFileSync('C:/Users/JULIAN/.gemini/antigravity-ide/brain/46081919-53c6-4929-a9c0-22480a2f2497/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (let l of lines) {
  if (l.includes('"step_index":801') || l.includes('"step_index":802')) {
    const obj = JSON.parse(l);
    console.log('Step:', obj.step_index, obj.type, obj.content || obj.tool_calls);
  }
}
