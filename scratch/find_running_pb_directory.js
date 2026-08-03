const { exec } = require('child_process');

const queryCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \\"name = 'pocketbase.exe'\\" | Select-Object ProcessId, ExecutablePath, CommandLine | Format-List"`;

exec(queryCmd, (err, stdout) => {
  if (err) {
    console.error("Error executing query:", err);
    return;
  }
  console.log("=== RUNNING POCKETBASE PROCESSES ===");
  console.log(stdout || "No running pocketbase.exe processes found.");
});
