import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT * FROM niif_assets WHERE id='t0be3bzx6l1wzvg'")
rec = cursor.fetchone()
cols = [d[0] for d in cursor.description]
print(json.dumps(dict(zip(cols, rec)), indent=2))

conn.close()
