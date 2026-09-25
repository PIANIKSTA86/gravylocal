import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT fields FROM _collections WHERE name='niif_assets'")
row = cursor.fetchone()
fields = json.loads(row[0])
print(f"Total fields: {len(fields)}")
for f in fields:
    print(f"name: {f.get('name'):<30} | type: {f.get('type'):<10} | required: {f.get('required')}")

conn.close()
