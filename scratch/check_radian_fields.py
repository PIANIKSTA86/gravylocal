import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT name, fields FROM _collections WHERE name='electronic_documents'")
row = cur.fetchone()
if row:
    fields = json.loads(row[1]) if row[1] else []
    names = [f.get('name') for f in fields]
    print("Total fields:", len(names))
    print("Fields:", names)
    print("Has radian_030_status?", 'radian_030_status' in names)
else:
    print("Not found")
conn.close()
