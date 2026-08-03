import os
import re

strings_file = 'scratch/database_strings.txt'
output_file = 'scratch/recovered_invoices.txt'

if not os.path.exists(strings_file):
    print("Strings file not found.")
else:
    with open(strings_file, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
    print(f"Total lines: {len(lines)}")
    
    # Filter lines containing invoice numbers (like 4P1C-00000190)
    invoice_pattern = re.compile(r'4P1C-\d{8}')
    
    recovered = {}
    for i, line in enumerate(lines):
        matches = invoice_pattern.findall(line)
        for m in matches:
            if m not in recovered:
                recovered[m] = []
            # Grab context (surrounding lines)
            start_ctx = max(0, i - 2)
            end_ctx = min(len(lines), i + 3)
            ctx = [lines[j].strip() for j in range(start_ctx, end_ctx)]
            recovered[m].append(ctx)
            
    print(f"Found {len(recovered)} distinct invoice numbers.")
    
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("INVOICES AND TRANSACTIONS CARVED FROM RAW DATA\n")
        out.write("==============================================\n\n")
        
        for inv_num in sorted(recovered.keys()):
            out.write(f"INVOICE NUMBER: {inv_num}\n")
            out.write("-" * 40 + "\n")
            seen_contexts = set()
            for ctx in recovered[inv_num]:
                ctx_str = "\n".join(ctx)
                if ctx_str not in seen_contexts:
                    seen_contexts.add(ctx_str)
                    for line in ctx:
                        out.write(f"  {line}\n")
                    out.write("\n")
            out.write("=" * 60 + "\n\n")
            
    print(f"Saved recovered invoices to {output_file}")
