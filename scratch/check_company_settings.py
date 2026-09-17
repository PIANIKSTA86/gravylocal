import sqlite3
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("SELECT key, value FROM settings WHERE key LIKE '%company%' OR key LIKE '%dv%' OR key LIKE '%ftech%'")
for row in cur.fetchall():
    print(f"{row[0]} = {row[1]}")
con.close()
