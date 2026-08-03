import os
import re
import json

db_path = 'empresas/pb_data/data.db'
output_path = 'scratch/carved_invoices_json.txt'

if not os.path.exists(db_path):
    print("Database not found.")
else:
    with open(db_path, 'rb') as f:
        content = f.read()
        
    print(f"Read database file of {len(content)} bytes.")
    
    # Let's search for JSON patterns in binary.
    # A JSON string of a PocketBase record starts with {" or has key-value pairs.
    # We can search for the string '4P1C-' and then look backward for '{' and forward for '}'
    # to extract a candidate JSON string.
    
    search_bytes = b'4P1C-'
    idx = 0
    candidates = []
    
    while True:
        idx = content.find(search_bytes, idx)
        if idx == -1:
            break
            
        # Look backward to find a '{' (up to 1000 bytes)
        start_pos = -1
        for i in range(idx, max(0, idx - 1500), -1):
            if content[i] == ord('{'):
                start_pos = i
                break
                
        # Look forward to find a '}' (up to 1500 bytes)
        end_pos = -1
        for i in range(idx, min(len(content), idx + 1500)):
            if content[i] == ord('}'):
                end_pos = i + 1
                break
                
        if start_pos != -1 and end_pos != -1:
            candidate_bytes = content[start_pos:end_pos]
            candidates.append((start_pos, candidate_bytes))
            
        idx += len(search_bytes)
        
    print(f"Found {len(candidates)} candidate JSON blocks.")
    
    # Deduplicate and validate JSON blocks
    unique_invoices = {}
    
    for offset, cb in candidates:
        try:
            # Clean up the string to remove binary characters before/after braces if any
            # and try to decode as UTF-8
            decoded = cb.decode('utf-8', errors='ignore')
            # Use regex to extract a valid JSON substring
            # We look for the first '{' and the matching '}'
            # A simple way is to find the longest substring that parses as JSON
            for start_idx in range(len(decoded)):
                if decoded[start_idx] == '{':
                    for end_idx in range(len(decoded), start_idx, -1):
                        if decoded[end_idx - 1] == '}':
                            substring = decoded[start_idx:end_idx]
                            try:
                                parsed = json.loads(substring)
                                if isinstance(parsed, dict) and ('number' in parsed or 'invoice_id' in parsed or 'consecutive' in parsed):
                                    num = parsed.get('number') or parsed.get('consecutive') or parsed.get('invoice_id')
                                    if num:
                                        # Keep the most complete JSON for each invoice number
                                        if num not in unique_invoices or len(substring) > len(json.dumps(unique_invoices[num])):
                                            unique_invoices[num] = parsed
                            except:
                                pass
        except Exception as e:
            pass
            
    print(f"Successfully decoded {len(unique_invoices)} unique JSON records.")
    
    # Save the structured report of recovered JSON records
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("RECOVERED INVOICES / LINES JSON PAYLOADS\n")
        out.write("=========================================\n\n")
        for num in sorted(unique_invoices.keys()):
            out.write(f"RECORD: {num}\n")
            out.write("-" * 40 + "\n")
            out.write(json.dumps(unique_invoices[num], indent=2, ensure_ascii=False) + "\n")
            out.write("=" * 60 + "\n\n")
            
    print(f"Report saved to {output_path}")
