const fs = require('fs');
const snippet = fs.readFileSync('scratch/full_raw_snippet.txt', 'utf8');

// The snippet is escaped inside JSON ("...\"...")
// Let's unescape it
let unescaped = snippet.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
// Find the closing bracket ']' of the array
const endBracket = unescaped.indexOf(']');
if (endBracket !== -1) {
  const jsonStr = unescaped.slice(0, endBracket + 1);
  try {
    const arr = JSON.parse(jsonStr);
    console.log(`SUCCESS! Parsed ${arr.length} rules!`);
    fs.writeFileSync('scratch/perfect_employee_rules.json', JSON.stringify(arr, null, 2));
  } catch (e) {
    console.error('Error at pos:', e.message);
    // Find where it failed
    console.log('Around 4950:', jsonStr.slice(4900, 5050));
  }
} else {
  console.log('No closing bracket found');
}

