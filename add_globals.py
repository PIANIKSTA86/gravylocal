import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    funcs = re.findall(r'^async function\s+([a-zA-Z0-9_]+)', content, re.MULTILINE)
    funcs += re.findall(r'^function\s+([a-zA-Z0-9_]+)', content, re.MULTILINE)
    
    # Catch exported const/let/var declarations
    # Only single declarations like `const foo =`
    vars = re.findall(r'^(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=', content, re.MULTILINE)
    # also catch `let foo;`
    vars += re.findall(r'^(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*;', content, re.MULTILINE)
    
    # specific fix for util.ts where we have `const $ = ...`, `const $$ = ...`
    vars += re.findall(r'^(?:const|let|var)\s+(\$|\$\$)\s*=', content, re.MULTILINE)

    exports = set(funcs + vars)
    if not exports:
        return
        
    # Exclude keywords or accidental matches
    exports = [e for e in exports if e not in ('if', 'for', 'while', 'switch', 'catch')]
    
    export_str = "\n// --- VITE MIGRATION GLOBALS ---\n"
    for exp in exports:
        export_str += f"(window as any).{exp} = {exp};\n"
    
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(export_str)

for root, dirs, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith('.ts') and f != 'main.ts':
            process_file(os.path.join(root, f))
