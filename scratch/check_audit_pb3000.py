import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

print("--- ALL FIELDS OF PRODUCT PB3000 ---")
cur.execute("SELECT * FROM products WHERE code = 'PB3000'")
cols = [description[0] for description in cur.description]
row = cur.fetchone()
for c, val in zip(cols, row):
    print(f"{c}: {val}")

print("\n--- AUDIT LOG FOR PB3000 ---")
cur.execute("SELECT * FROM audit_log WHERE entity_id = 'qv46yr2j9xkv7cp' OR details LIKE '%PB3000%'")
for r in cur.fetchall():
    print(r)
