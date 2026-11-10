const fs = require('fs');
let content = fs.readFileSync('scratch/match4.txt', 'utf8');

// Replace escaped newlines
content = content.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\"/g, '"');

const rules = [];
const lines = content.split('\n');
lines.forEach(l => {
  const m = l.match(/\[\d+\]\s*(\{.*\})/);
  if (m) {
    try {
      rules.push(JSON.parse(m[1]));
    } catch (e) {
      console.error('Failed to parse line:', e.message, m[1].slice(0, 50));
    }
  }
});

console.log(`Parsed ${rules.length} complete rules!`);
if (rules.length === 22) {
  fs.writeFileSync('scratch/all_22_rules_original.json', JSON.stringify(rules, null, 2));
  console.log('Saved all_22_rules_original.json successfully!');
}
