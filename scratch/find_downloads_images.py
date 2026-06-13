import os
import time

downloads_path = r'c:\Users\JULIAN\Downloads'
extensions = ('.png', '.jpg', '.jpeg', '.webp', '.gif')

if os.path.exists(downloads_path):
    print("Images found in Downloads:")
    for root, dirs, files in os.walk(downloads_path):
        # Avoid walking too deep if it's large
        if len(root.split(os.sep)) - len(downloads_path.split(os.sep)) > 2:
            continue
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
    print("Downloads path does not exist")
