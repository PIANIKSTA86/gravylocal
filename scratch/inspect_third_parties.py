import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name, fields FROM _collections WHERE name='third_parties'")
row = cursor.fetchone()
if row:
    name, fields_json = row
    fields = json.loads(fields_json)
    print("third_parties fields:")
    for f in fields:
        print(f"  - {f.get('name')} ({f.get('type')}){' *' if f.get('required') else ''}")
else:
    print("third_parties collection not found")

conn.close()
