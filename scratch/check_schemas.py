import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT fields FROM _collections WHERE name='purchase_invoices'")
row = c.fetchone()
if row:
    fields = json.loads(row[0])
    print(f"Campos en purchase_invoices ({len(fields)}):")
    for f in fields:
        print(f"  - {f['name']} ({f['type']})")
else:
    # check pragma of _collections
    c.execute("PRAGMA table_info(_collections)")
    print(c.fetchall())
