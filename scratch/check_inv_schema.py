import sqlite3, json

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
row = cur.execute("SELECT fields FROM _collections WHERE name = 'inventory_movement_lines'").fetchone()
if row and row[0]:
    for f in json.loads(row[0]):
        print(f"{f.get('name')}: required={f.get('required')}, type={f.get('type')}")
