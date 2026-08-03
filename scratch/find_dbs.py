import os
import glob

print("Searching for database files...")
for f in glob.glob("**/*.db", recursive=True):
    print(f"  {f} - {os.path.getsize(f)} bytes")
