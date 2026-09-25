import subprocess

p = subprocess.run(['powershell', '-Command', "Get-WmiObject Win32_Process -Filter \"Name = 'pocketbase.exe'\" | Select-Object ProcessId, CommandLine | Format-List"], capture_output=True, text=True)
print(p.stdout)
