import os
import time

pics_path = r'c:\Users\JULIAN\Pictures'
extensions = ('.png', '.jpg', '.jpeg', '.webp', '.gif')

if os.path.exists(pics_path):
    print("Files in Pictures:")
    for root, dirs, files in os.walk(pics_path):
        for f in files:
            if f.lower().endswith(extensions):
                f_path = os.path.join(root, f)
                try:
                    mtime = os.path.getmtime(f_path)
                    mtime_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(mtime))
                    print(f"  - {f_path} | Size: {os.path.getsize(f_path)} bytes | Modified: {mtime_str}")
                except:
                    pass
else:
    print("Pictures folder does not exist")
