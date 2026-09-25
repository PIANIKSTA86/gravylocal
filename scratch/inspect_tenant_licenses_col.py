import sqlite3
import json

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("SELECT fields FROM _collections WHERE name='licenses'")
row = cur.fetchone()
if row:
    fields = json.loads(row[0])
    for f in fields:
        if f.get('name') == 'module_key':
            print("module_key field definition in Tenant licenses:")
            print(json.dumps(f, indent=2))
