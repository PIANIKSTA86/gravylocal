import subprocess
import json
import tempfile
import os

script_path = r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py"

print("--- STRESS TEST 2: Markdown heading starting with # Unleash ---")
md_heading_content = """# Unleash Your Potential
Here is some clean text.
"""
with tempfile.NamedTemporaryFile('w', delete=False, suffix='.md', encoding='utf-8') as f:
    f.write(md_heading_content)
    test_file = f.name

res = subprocess.run(['py', script_path, test_file, '--json'], capture_output=True, text=True, encoding='utf-8')
data = json.loads(res.stdout)
print('Total buzzwords found in markdown heading:', data['summary']['total_buzzwords'])
os.remove(test_file)
