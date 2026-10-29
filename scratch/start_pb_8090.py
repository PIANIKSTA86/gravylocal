import subprocess
import time
import urllib.request

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

proc = subprocess.Popen(
    ['pocketbase.exe', 'serve', '--http=0.0.0.0:8090', '--dir=pb_data', '--publicDir=pb_public', '--hooksDir=pb_hooks'],
    creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
    close_fds=True
)

print(f"PocketBase process launched with PID: {proc.pid}")
time.sleep(4)

try:
    with urllib.request.urlopen('http://127.0.0.1:8090/api/health') as resp:
        print("Health status:", resp.status)
except Exception as e:
    print("Health check error:", e)

