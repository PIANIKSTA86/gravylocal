const { spawn } = require('child_process');
const path = require('path');

const pbExe = 'C:\\GravyLocal\\pocketbase.exe';
const hooksDir = 'C:\\GravyLocal\\pb_hooks';
const dirPath = 'C:\\GravyLocal\\pb_data';

console.log("=== STARTING POCKETBASE TEST ON PORT 9000 ===");
console.log("Loading hooks from:", hooksDir);

const pbProcess = spawn(pbExe, [
  'serve',
  '--http=127.0.0.1:9000',
  `--dir=${dirPath}`,
  `--hooksDir=${hooksDir}`
], {
  stdio: 'pipe'
});

let output = "";
pbProcess.stdout.on('data', (data) => {
  output += data.toString();
});

pbProcess.stderr.on('data', (data) => {
  output += data.toString();
});

setTimeout(() => {
  pbProcess.kill();
  console.log("\n=== POCKETBASE OUTPUT ===");
  console.log(output || "No output captured.");
  console.log("=========================");
}, 4000);
