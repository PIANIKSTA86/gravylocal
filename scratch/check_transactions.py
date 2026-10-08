import sqlite3
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
tx = cur.execute("SELECT * FROM transactions WHERE id = '3qkwnyr99pk1ezd'").fetchone()
cols = [r[1] for r in cur.execute("PRAGMA table_info(transactions)").fetchall()]
for c, val in zip(cols, tx):
    print(f"{c}: {val}")
