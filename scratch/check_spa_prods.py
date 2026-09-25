import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("SELECT * FROM products WHERE code='SPA-01'")
row = cur.fetchone()
cols = [desc[0] for desc in cur.description]
for c, v in zip(cols, row):
    if v is not None and v != "":
        print(f" {c}: {v}")
con.close()
