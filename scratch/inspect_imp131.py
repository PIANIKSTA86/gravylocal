import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT id, number FROM transactions WHERE number = 'IMP-00000131'")
tx = c.fetchone()
if tx:
    print("Transaction:", tx)
    c.execute(f"SELECT * FROM tx_lines WHERE tx_id = '{tx[0]}'")
    cols = [d[0] for d in c.description]
    for r in c.fetchall():
        print("Tx line:", dict(zip(cols, r)))
