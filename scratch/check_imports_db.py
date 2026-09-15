import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# 1. Check columns of imports
cursor.execute("PRAGMA table_info(imports)")
import_cols = [row[1] for row in cursor.fetchall()]
print("=== IMPORTS COLUMNS ===")
print(import_cols)

# 2. Check if import_invoices exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%import%'")
print("=== IMPORT TABLES ===")
print([row[0] for row in cursor.fetchall()])

# 3. Check import_lines columns
cursor.execute("PRAGMA table_info(import_lines)")
print("=== IMPORT_LINES COLUMNS ===")
print([row[1] for row in cursor.fetchall()])

# 4. Check import_invoices columns if exists
try:
    cursor.execute("PRAGMA table_info(import_invoices)")
    print("=== IMPORT_INVOICES COLUMNS ===")
    print([row[1] for row in cursor.fetchall()])
except Exception as e:
    print("import_invoices error:", e)

# 5. Check actual records in imports
cursor.execute("SELECT id, number, status, supplier_id FROM imports LIMIT 10")
print("=== IMPORTS ROWS ===")
print(cursor.fetchall())

# 6. Check _collections schema for imports and import_invoices
cursor.execute("PRAGMA table_info(_collections)")
print("=== _COLLECTIONS COLS ===")
print([row[1] for row in cursor.fetchall()])

cursor.execute("SELECT id, name, fields FROM _collections WHERE name IN ('imports', 'import_lines', 'import_invoices')")
for r in cursor.fetchall():
    print(f"Collection {r[1]} (id={r[0]}):")
    try:
        parsed = json.loads(r[2])
        field_names = [f.get('name') for f in parsed] if isinstance(parsed, list) else []
        print(f"  Fields: {field_names}")
    except Exception as ex:
        print(f"  err: {ex}")



conn.close()
