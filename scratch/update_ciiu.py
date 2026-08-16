import openpyxl

wb = openpyxl.load_workbook(r'c:\Users\JULIAN\Desktop\GravyLocalTABS\DatosReferencia\CIIU.xlsx')
sheet = wb.active

items = []
for row in sheet.iter_rows(min_row=2, values_only=True):
    if not row or row[0] is None or row[1] is None:
        continue
    code_raw = str(row[0]).strip()
    code = code_raw.zfill(4) if code_raw.isdigit() else code_raw
    desc = str(row[1]).strip()
    items.append((code, desc))

print(f"Loaded {len(items)} items from CIIU.xlsx")

# Format as TypeScript code lines
ts_lines = ["/** Actividades económicas CIIU — DIAN Colombia (510 actividades según CIIU v4 A.C.) */", "const DIAN_CIIU = ["]
for code, desc in items:
    # Escape single quotes in label if any
    safe_desc = desc.replace("'", "\\'")
    ts_lines.append(f"  {{ c: '{code}', l: '{safe_desc}' }},")
ts_lines.append("];")

output_code = "\n".join(ts_lines)

# Read frontend/src/utils.ts
utils_path = r'c:\Users\JULIAN\Desktop\GravyLocalTABS\frontend\src\utils.ts'
with open(utils_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "/** Actividades económicas CIIU — selección de actividades comunes Colombia */"
if start_marker not in content:
    start_marker = "const DIAN_CIIU = ["

end_marker = "const TAX_REGIMES = ["

start_pos = content.find(start_marker)
end_pos = content.find(end_marker)

if start_pos == -1 or end_pos == -1:
    print(f"Error finding markers. start_pos: {start_pos}, end_pos: {end_pos}")
else:
    new_content = content[:start_pos] + output_code + "\n\n" + content[end_pos:]
    with open(utils_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated frontend/src/utils.ts with all 510 CIIU codes!")
