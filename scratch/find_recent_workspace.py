import os
import time

workspace_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0'
now = time.time()

print("Recent files in workspace (last 2 hours):")
for root, dirs, files in os.walk(workspace_path):
    # Exclude node_modules, .git, pb_data
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.git' in dirs:
        dirs.remove('.git')
    if 'pb_data' in dirs:
         dirs.remove('pb_data')
         
    for f in files:
        f_path = os.path.join(root, f)
        try:
            mtime = os.path.getmtime(f_path)
            age_seconds = now - mtime
            if age_seconds < 7200: # 2 hours
                print(f"Found: {f_path} | Size: {os.path.getsize(f_path)} bytes | Age: {int(age_seconds/60)} mins ago")
        except:
            pass

print("Done scanning.")
