import os

downloads_path = r'c:\Users\JULIAN\Downloads'

if os.path.exists(downloads_path):
    print("Files in Downloads:")
    for f in os.listdir(downloads_path):
        f_path = os.path.join(downloads_path, f)
        if os.path.isfile(f_path):
            print(f"  - {f} ({os.path.getsize(f_path)} bytes)")
else:
    print("Downloads path does not exist")
