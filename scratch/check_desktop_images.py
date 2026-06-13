import os
import time

files = [
    r'c:\Users\JULIAN\Desktop\LOGO_4PT.png',
    r'c:\Users\JULIAN\Desktop\usb.jpg',
    r'c:\Users\JULIAN\Desktop\custom-select-20.gif',
    r'c:\Users\JULIAN\Desktop\anyddesk.png'
]

print("Desktop images status:")
for f in files:
    if os.path.exists(f):
        mtime = os.path.getmtime(f)
        mtime_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(mtime))
        print(f"File: {f} | Size: {os.path.getsize(f)} bytes | Modified: {mtime_str}")
    else:
        print(f"File does not exist: {f}")
