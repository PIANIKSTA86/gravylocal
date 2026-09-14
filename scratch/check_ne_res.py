import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cur = conn.cursor()
cur.execute("PRAGMA table_info(dian_resolutions)")
cols = [r[1] for r in cur.fetchall()]
print("Cols:", cols)
cur.execute("SELECT * FROM dian_resolutions WHERE document_type = 'NE'")
for row in cur.fetchall():
    print(dict(zip(cols, row)))
