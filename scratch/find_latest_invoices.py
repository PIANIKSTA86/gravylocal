import os
import re

strings_file = 'scratch/database_strings.txt'

if not os.path.exists(strings_file):
    print("Strings file not found.")
else:
    with open(strings_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    print("Searching for recent invoices (numbers 175 to 220)...")
    
    # We look for 4P1C-00000175 up to 4P1C-00000220
    for num in range(175, 221):
        inv_str = f"4P1C-{num:08d}"
        # Find all occurrences of this string in the file with context
        idx = 0
        found_any = False
        while True:
            idx = content.find(inv_str, idx)
            if idx == -1:
                break
            found_any = True
            # Print 300 characters of context around the match
            start = max(0, idx - 150)
            end = min(len(content), idx + 350)
            ctx = content[start:end].replace('\n', ' ')
            # Clean up double spaces
            ctx = ' '.join(ctx.split())
            print(f"[{inv_str}] Offset {idx}: ... {ctx} ...")
            print("-" * 80)
            idx += len(inv_str)
            
        if not found_any:
            # Check if just the number is present
            pass
