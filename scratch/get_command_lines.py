import subprocess
import sys

def get_pbes():
    cmd = [
        "powershell",
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process -Filter \"Name='pocketbase.exe'\" | Select-Object ProcessId, CommandLine | ConvertTo-Json"
    ]
    try:
        output = subprocess.check_output(cmd).decode('utf-8', errors='ignore')
        print(output)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    get_pbes()
