const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'pb_hooks', 'dian.pb.js');

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Extract sendInvoiceEmailHelper code
// The function starts with: function sendInvoiceEmailHelper(txId, customEmail) {
// And ends with the matching closing brace.
// Let's locate it by string manipulation or brace counting.
const startIdx = content.indexOf('function sendInvoiceEmailHelper(txId, customEmail) {');
if (startIdx === -1) {
  console.error("Could not find sendInvoiceEmailHelper start.");
  process.exit(1);
}

// Find matching closing brace
let braceCount = 0;
let endIdx = -1;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
  } else if (content[i] === '}') {
    braceCount--;
    if (braceCount === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error("Could not find matching closing brace for sendInvoiceEmailHelper.");
  process.exit(1);
}

const helperCode = content.substring(startIdx, endIdx);
console.log(`[+] Extracted sendInvoiceEmailHelper (${helperCode.length} chars)`);

// Remove helperCode from the top of the file (including any surrounding newlines)
content = content.replace(helperCode, '');

// Now we need to inline it into the 3 route handlers:
// 1) /api/dian/emit
// 2) /api/dian/check-status
// 3) /api/dian/resend-email

// Helper to inject function at the start of a route handler
function injectHelper(contentStr, routePattern) {
  const idx = contentStr.indexOf(routePattern);
  if (idx === -1) {
    console.error(`Could not find route pattern: ${routePattern}`);
    process.exit(1);
  }
  
  // Find the opening brace of the route callback: (e) => {
  const callbackStart = contentStr.indexOf('{', idx);
  if (callbackStart === -1 || callbackStart > idx + 100) {
    console.error(`Could not find opening brace for route: ${routePattern}`);
    process.exit(1);
  }
  
  const insertPos = callbackStart + 1;
  const newContent = contentStr.slice(0, insertPos) + '\n\n' + helperCode + '\n\n' + contentStr.slice(insertPos);
  return newContent;
}

content = injectHelper(content, "routerAdd('POST', '/api/dian/emit'");
content = injectHelper(content, "routerAdd('POST', '/api/dian/check-status'");
content = injectHelper(content, "routerAdd('POST', '/api/dian/resend-email'");

fs.writeFileSync(filePath, content, 'utf8');
console.log("[+] Successfully inlined sendInvoiceEmailHelper into all 3 route handlers!");
