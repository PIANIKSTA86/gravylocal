import subprocess

cmd = ['powershell', '-Command', 'Get-CimInstance Win32_Process | Where-Object { $_.Name -like "*pocketbase*" } | Select-Object ProcessId, CommandLine | Format-List']
p = subprocess.run(cmd, capture_output=True, text=True)
print(p.stdout)
