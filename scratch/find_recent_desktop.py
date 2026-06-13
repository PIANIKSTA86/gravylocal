import os
import time

desktop_path = r'c:\Users\JULIAN\Desktop'
now = time.time()

print("Recent files on Desktop (last 1 hour):")
for f in os.listdir(desktop_path):
    f_path = os.path.join(desktop_path, f)
    if os.path.isfile(f_path):
        mtime = os.path.getmtime(f_path)
        age_seconds = now - mtime
        if age_seconds < 3600: # 1 hour
            print(f"Found: {f} | Size: {os.path.getsize(f_path)} bytes | Age: {int(age_seconds/60)} mins ago")

print("Recent folders on Desktop (last 1 hour):")
for d in os.listdir(desktop_path):
    d_path = os.path.join(desktop_path, d)
    if os.path.isdir(d_path):
        mtime = os.path.getmtime(d_path)
        age_seconds = now - mtime
        if age_seconds < 3600: # 1 hour
            print(f"Found Folder: {d} | Age: {int(age_seconds/60)} mins ago")
