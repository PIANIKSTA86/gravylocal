import subprocess
import json
import tempfile
import os
import sys

script_path = r"C:\Users\JULIAN\.gemini\config\skills\human-interface-design\scripts\audit_copy.py"

print("--- STRESS TEST 1: Hyphenated CSS with frictionless ---")
test_content = '<button class="btn-frictionless">Click</button>\n'
with tempfile.NamedTemporaryFile('w', delete=False, suffix='.html', encoding='utf-8') as f:
    f.write(test_content)
    test_file = f.name

res = subprocess.run(['py', script_path, test_file, '--json'], capture_output=True, text=True, encoding='utf-8')
print('Return code:', res.returncode)
data = json.loads(res.stdout)
print('Total buzzwords:', data['summary']['total_buzzwords'])
if data['files'] and data['files'][0]['findings']:
    print('Findings:', data['files'][0]['findings'])
os.remove(test_file)
