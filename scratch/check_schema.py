import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
row = c.execute("SELECT fields FROM _collections WHERE name='niif_asset_events'").fetchone()
if row:
    fields = json.loads(row[0])
    print("niif_asset_events fields:", [f.get('name') for f in fields])
else:
    print("niif_asset_events not found")

row2 = c.execute("SELECT fields FROM _collections WHERE name='transactions'").fetchone()
if row2:
    fields2 = json.loads(row2[0])
    print("transactions fields:", [f.get('name') for f in fields2])

row3 = c.execute("SELECT name FROM _collections WHERE name LIKE '%depr%' OR name LIKE '%liquid%'").fetchall()
print("Collections matching depr or liquid:", row3)
