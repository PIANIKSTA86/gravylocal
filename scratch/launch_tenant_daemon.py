import subprocess
import time

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

with open("tenant.log", "w", encoding="utf-8") as out:
    proc = subprocess.Popen(
        ['pocketbase.exe', 'serve', '--http=0.0.0.0:8090', '--dir=pb_data', '--publicDir=pb_public', '--hooksDir=pb_hooks'],
        creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
        stdout=out,
        stderr=subprocess.STDOUT
    )

print(f"Spawned PocketBase on 8090 with PID {proc.pid}")
time.sleep(3)
