import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("SELECT key, value FROM settings WHERE key LIKE '%invent%' OR key LIKE '%cost%'")
for r in cur.fetchall():
    print(r[0], "-->", r[1])
