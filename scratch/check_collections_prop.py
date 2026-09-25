import sqlite3, json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, name, fields FROM _collections WHERE name = 'ph_properties'")
row = c.fetchone()
if row:
    print(f"Collection ID: {row[0]}, Name: {row[1]}")
    fields = json.loads(row[2])
    print("Fields in _collections:")
    for f in fields:
        print(f"  {f.get('name')} ({f.get('type')}) - id: {f.get('id')}")
conn.close()
