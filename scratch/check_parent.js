const { execSync } = require('child_process');
try {
  const out = execSync('powershell "Get-CimInstance Win32_Process -Filter \\"ProcessId=13660\\" | Select-Object ProcessId, ParentProcessId, Name, CommandLine | Format-List"').toString();
  console.log(out);
} catch (e) {
  console.error(e.message);
}
