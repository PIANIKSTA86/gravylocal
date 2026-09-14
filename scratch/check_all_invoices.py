import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- ALL PURCHASE INVOICES ---")
cur.execute("SELECT id, number, tx_number, tx_id, status, supplier_ref, subtotal, total FROM purchase_invoices")
for r in cur.fetchall():
    print(dict(r))

print("\n--- ALL INVOICES WHERE status = 'voided' or tx_id = '' ---")
cur.execute("SELECT id, number, tx_number, tx_id, status, subtotal, total FROM invoices WHERE status = 'voided' OR tx_id = ''")
for r in cur.fetchall():
    print(dict(r))
