import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, tx_id, account_id, debit, credit, import_id, import_concept FROM tx_lines WHERE import_id = 'o6r1vqd7mnnty34'")
cols = [d[0] for d in c.description]
print("Lines with import_id = 'o6r1vqd7mnnty34':")
for r in c.fetchall():
    print(dict(zip(cols, r)))

c.execute("SELECT id, tx_id, account_id, debit, credit, import_id, import_concept FROM tx_lines WHERE account_id = 'sxpe37zn3srbjki'")
print("\nLines with account_id = 'sxpe37zn3srbjki' (14650593):")
for r in c.fetchall():
    print(dict(zip(cols, r)))
