import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- CHECKING ALL SALES INVOICES vs TRANSACTIONS ---")
cur.execute("SELECT id, number, tx_number, tx_id, status, subtotal, total FROM invoices")
mismatches = 0
for inv in cur.fetchall():
    if not inv['tx_id']:
        continue
    cur.execute("SELECT id, number FROM transactions WHERE id = ?", (inv['tx_id'],))
    t_by_id = cur.fetchone()
    if not t_by_id:
        print(f"INV {inv['number']} tx_id {inv['tx_id']} not found in transactions")
        mismatches += 1
    elif inv['number'] != t_by_id['number'] and (inv['tx_number'] and inv['tx_number'] != t_by_id['number']):
        print(f"INV {inv['number']} (tx_number={inv['tx_number']}) points to TX {t_by_id['number']}")
        mismatches += 1

print(f"Total sales invoices checked. Mismatches found: {mismatches}")
