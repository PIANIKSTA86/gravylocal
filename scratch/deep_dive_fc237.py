import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- TX FC-00000237 ---")
cur.execute("SELECT * FROM transactions WHERE number = 'FC-00000237'")
for r in cur.fetchall():
    print(dict(r))

print("\n--- PURCHASE INVOICE zf8hjs91mgboufj ---")
cur.execute("SELECT * FROM purchase_invoices WHERE id = 'zf8hjs91mgboufj'")
for r in cur.fetchall():
    print(dict(r))

print("\n--- PURCHASE INVOICE ITEMS for zf8hjs91mgboufj ---")
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%purchase%'")
print([r[0] for r in cur.fetchall()])
try:
    cur.execute("SELECT * FROM purchase_invoice_items WHERE invoice_id = 'zf8hjs91mgboufj' OR purchase_invoice_id = 'zf8hjs91mgboufj'")
    for r in cur.fetchall():
        print(dict(r))
except Exception as e:
    print(e)

print("\n--- ALL TX_TYPES ---")
cur.execute("SELECT id, prefix, name FROM transaction_types")
for r in cur.fetchall():
    print(dict(r))
