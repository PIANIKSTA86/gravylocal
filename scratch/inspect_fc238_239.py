import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- PI FC-00000238 and FC-00000239 ---")
cur.execute("SELECT * FROM purchase_invoices WHERE id IN ('pjff46mkkfmdd9l', '75t0n9f18w0bj6p')")
for r in cur.fetchall():
    print(dict(r))

print("\n--- TRANSACTIONS FOR FC-00000238 and FC-00000239 ---")
cur.execute("SELECT * FROM transactions WHERE number IN ('FC-00000238', 'FC-00000239')")
for r in cur.fetchall():
    print(dict(r))
