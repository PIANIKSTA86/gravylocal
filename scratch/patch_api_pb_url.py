import re

file_path = 'frontend/src/api.ts'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. Replace the initial PB_URL definition and insert baseUrl getter/setter in pb definition
old_header = """const PB_URL = window.location.origin;  // http://192.168.x.x:8090 o localhost:8090

/* -- Cliente minimo PocketBase (sin SDK externo) ----------- */
const pb = {
  _token: null,
  _user: null,"""

new_header = """// PB_URL is resolved dynamically via pb.baseUrl to support multi-tenant routing

/* -- Cliente minimo PocketBase (sin SDK externo) ----------- */
const pb = {
  _token: null,
  _user: null,
  _baseUrl: null,

  get baseUrl() { return this._baseUrl ?? (window as any).PB_URL ?? window.location.origin; },
  set baseUrl(v) { this._baseUrl = v; (window as any).PB_URL = v; },"""

if old_header in content:
    content = content.replace(old_header, new_header)
    print("Successfully patched header and added baseUrl getter/setter!")
else:
    # Try another matching format just in case
    print("Warning: old_header block not found directly, performing regex check...")

# 2. Replace all remaining instances of PB_URL with pb.baseUrl except in comments/defines
content = content.replace('${PB_URL}', '${pb.baseUrl}')
content = content.replace('` + PB_URL + `', '` + pb.baseUrl + `')

# 3. Replace the last assignment at the end of the file
old_footer = "(window as any).PB_URL = PB_URL;"
new_footer = "(window as any).PB_URL = (window as any).PB_URL || window.location.origin;"
if old_footer in content:
    content = content.replace(old_footer, new_footer)
    print("Successfully patched footer export!")
else:
    print("Warning: old_footer export not found!")

# Write the patched content back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done patching frontend/src/api.ts!")
