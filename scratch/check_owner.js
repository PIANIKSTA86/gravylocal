const { execSync } = require('child_process');
try {
  const out = execSync('powershell "Get-Process -Id 6388 -IncludeUserName | Select-Object Id, UserName, ProcessName"').toString();
  console.log(out);
} catch (e) {
  console.log('Error:', e.message);
}
