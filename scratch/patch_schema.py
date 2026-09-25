import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT fields FROM _collections WHERE name='niif_assets'")
row = cursor.fetchone()
fields = json.loads(row[0])

changed = False
for f in fields:
    if f.get('name') in ('useful_life_niif', 'useful_life_fiscal'):
        if f.get('required') is True:
            f['required'] = False
            changed = True
            print(f"Changed {f['name']} required from True to False")

if changed:
    cursor.execute("UPDATE _collections SET fields=?, updated=datetime('now') WHERE name='niif_assets'", (json.dumps(fields),))
    conn.commit()
    print("Successfully updated _collections in pb_data/data.db")
else:
    print("Fields were already not required")

conn.close()
