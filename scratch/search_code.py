import os
import re

root_dir = r"c:\Users\JULIAN\Desktop\GravyLocal2.0"

def search_files():
    patterns = [
        r"tx_lines",
        r"updateTransaction",
        r"saveEditTx",
        r"total",
    ]
    
    for root, dirs, files in os.walk(root_dir):
        if ".git" in root or "node_modules" in root or "dist" in root:
            continue
        for f in files:
            if f.endswith(('.js', '.ts', '.pb.js', '.json', '.sql', '.py')):
                filepath = os.path.join(root, f)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                        content = file.read()
                        for p in patterns:
                            matches = list(re.finditer(p, content, re.IGNORECASE))
                            if matches:
                                print(f"File: {filepath} matched '{p}' ({len(matches)} times)")
                except Exception as e:
                    pass

if __name__ == "__main__":
    search_files()
