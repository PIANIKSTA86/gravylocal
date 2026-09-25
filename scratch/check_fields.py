import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT fields FROM _collections WHERE name='niif_assets'")
row = cursor.fetchone()
fields = json.loads(row[0])
for f in fields:
    if f.get('name') in ('depreciation_method', 'useful_life_niif', 'useful_life_fiscal', 'status'):
        print(json.dumps(f, indent=2))

conn.close()
