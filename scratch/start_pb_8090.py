import subprocess
import time

proc = subprocess.Popen(
    ['pocketbase.exe', 'serve', '--http=0.0.0.0:8090', '--dir=pb_data', '--publicDir=pb_public', '--hooksDir=pb_hooks'],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

time.sleep(3)
if proc.poll() is not None:
    print(f"Exited with code: {proc.returncode}")
    print("Output:")
    print(proc.stdout.read())
else:
    print("Process is running! PID:", proc.pid)
    # read available lines without blocking
    import select
    print("PocketBase started successfully on 8090.")
