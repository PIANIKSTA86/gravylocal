const fs = require('fs');
const path = require('path');

const hooksDir = 'C:\\GravyLocal\\pb_hooks';

if (!fs.existsSync(hooksDir)) {
  console.log(`[-] Folder not found: ${hooksDir}`);
  process.exit(1);
}

const files = fs.readdirSync(hooksDir);
const hookFiles = files.filter(f => f.endsWith('.pb.js'));

console.log("=== PB_HOOKS FILES ENDING IN .pb.js IN C:\\GravyLocal\\pb_hooks ===");
hookFiles.forEach(f => {
  const stat = fs.statSync(path.join(hooksDir, f));
  console.log(`- ${f} (${stat.size} bytes)`);
});
