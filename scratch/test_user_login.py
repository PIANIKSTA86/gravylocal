import sqlite3
con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
for u in cur.execute("SELECT id, email, name, role, last_activity_at, allowed_branches FROM users ORDER BY last_activity_at DESC LIMIT 5").fetchall():
    print(u)
