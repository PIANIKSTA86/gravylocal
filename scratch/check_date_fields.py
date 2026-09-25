import sqlite3, json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, name, fields FROM _collections WHERE name = 'ph_invoices'")
row = c.fetchone()
if row:
    print(f"Collection ID: {row[0]}, Name: {row[1]}")
    fields = json.loads(row[2])
    for f in fields:
        if f.get('type') == 'date' or 'date' in f.get('name'):
            print(f"  Field: {f}")
conn.close()
