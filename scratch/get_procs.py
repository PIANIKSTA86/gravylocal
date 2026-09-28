import subprocess

script = "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'pocketbase.exe' } | Select-Object ProcessId, CommandLine | Format-List"
res = subprocess.run(["powershell", "-NoProfile", "-Command", script], capture_output=True, text=True)
print(res.stdout)
