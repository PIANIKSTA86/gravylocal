const { execSync } = require('child_process');
const queryCmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"ProcessId = 14664\\" | Select-Object ProcessId, ExecutablePath, CommandLine | ConvertTo-Json"`;
console.log(execSync(queryCmd, { encoding: 'utf8' }));

