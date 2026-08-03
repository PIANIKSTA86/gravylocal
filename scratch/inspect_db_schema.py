import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("SELECT fields FROM _collections WHERE name='transactions'")
fields_str = cur.fetchone()[0]
fields = json.loads(fields_str)
for field in fields:
    if field['name'] == 'third_party_id':
        print("third_party_id field schema:", field)
conn.close()
