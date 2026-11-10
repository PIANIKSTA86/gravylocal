const fs = require('fs');

const transcriptPath = 'C:\\Users\\JULIAN\\.gemini\\antigravity\\brain\\f3c04642-4eac-425c-a251-f3047941ec87\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');

// Find the JSON of employee_rules
const marker = 'payroll_accounting_config_v1_employee_rules_part_001';
let pos = content.indexOf(marker);
console.log('Found marker at pos:', pos);

// Let's find occurrences of [{"employee_id":"
let cur = 0;
while ((cur = content.indexOf('[{\\"employee_id\\":', cur + 1)) !== -1) {
  console.log('Found array at pos:', cur);
  const snippet = content.slice(cur, cur + 300);
  console.log('Snippet:', snippet);
  // Find the end of this array
  const endPos = content.indexOf('}]', cur);
  if (endPos !== -1) {
    const rawArray = content.slice(cur, endPos + 2).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    try {
      const parsed = JSON.parse(rawArray);
      console.log(`Parsed valid array of ${parsed.length} rules!`);
      fs.writeFileSync('scratch/extracted_rules.json', JSON.stringify(parsed, null, 2));
      break;
    } catch (e) {
      console.log('Parse error on this snippet:', e.message);
    }
  }
}

