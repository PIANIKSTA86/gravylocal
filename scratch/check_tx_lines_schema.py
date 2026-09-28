import sqlite3, json

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
row = cur.execute("SELECT fields FROM _collections WHERE name = 'tx_lines'").fetchone()
if row and row[0]:
    for f in json.loads(row[0]):
        if 'import' in f.get('name', ''):
            print(f)
