import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

row = cursor.execute('SELECT fields FROM _collections WHERE name="imports"').fetchone()
fields = json.loads(row[0])
print(f"Total fields in imports: {len(fields)}")
for f in fields:
    print(f"  - {f.get('name')} ({f.get('type')})")

print("\nChecking if is_consolidated is in imports fields:")
print(any(f.get('name') == 'is_consolidated' for f in fields))

print("\nsupplier_id definition:")
for f in fields:
    if f.get('name') in ('supplier_id', 'stage_expenses'):
        print(json.dumps(f, indent=2))

row2 = cursor.execute('SELECT fields FROM _collections WHERE name="import_lines"').fetchone()
fields2 = json.loads(row2[0])
print(f"\nTotal fields in import_lines: {len(fields2)}")
for f in fields2:
    print(f"  - {f.get('name')} ({f.get('type')})")

conn.close()
