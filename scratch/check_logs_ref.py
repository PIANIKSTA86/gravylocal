import os
import re

logs_dir = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\logs\dian'
for fName in os.listdir(logs_dir):
    if fName.endswith('.txt'):
        filePath = os.path.join(logs_dir, fName)
        with open(filePath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            if 'REF' in content or 'Nodo REF' in content:
                print(f"File {fName}:")
                for line in content.splitlines():
                    if 'error' in line.lower() or 'REF' in line:
                        print("  ", line[:200])
