const { execSync } = require('child_process');
try {
  const out = execSync('powershell "Get-Process -Id 15468 | Format-List Path, StartTime, Id"').toString();
  console.log(out);
} catch (e) {
  console.error(e.message);
}
