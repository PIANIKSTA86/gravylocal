import os
import time

downloads_path = r'c:\Users\JULIAN\Downloads'
now = time.time()

if os.path.exists(downloads_path):
    print("Recent files in Downloads (last 2 hours):")
    for f in os.listdir(downloads_path):
        f_path = os.path.join(downloads_path, f)
        if os.path.isfile(f_path):
            mtime = os.path.getmtime(f_path)
            age_seconds = now - mtime
            if age_seconds < 7200: # 2 hours
                print(f"Found: {f} | Size: {os.path.getsize(f_path)} bytes | Age: {int(age_seconds/60)} mins ago")
else:
    print("Downloads path does not exist")
