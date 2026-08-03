const fs = require('fs');
const filePath = 'C:\\GravyLocal\\pb_hooks\\dian.pb.js';

if (!fs.existsSync(filePath)) {
  console.log("[-] File not found at C:\\GravyLocal\\pb_hooks\\dian.pb.js");
  process.exit(1);
}

const lines = fs.readFileSync(filePath, 'utf8').split('\n');

console.log("=== DECLARATION OF sendInvoiceEmailHelper (Lines 40-55) ===");
for (let i = 39; i < 55; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

console.log("\n=== CALL OF sendInvoiceEmailHelper in resend-email ROUTE (Lines 2555-2578) ===");
for (let i = 2554; i < Math.min(lines.length, 2578); i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
