import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
for u in cur.execute("SELECT id, name, role, allowed_branches FROM users").fetchall():
    print("User:", u)

for w in cur.execute("SELECT id, name, branch_id FROM warehouses").fetchall():
    print("Warehouse:", w)
