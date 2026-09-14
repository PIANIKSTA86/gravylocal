import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("=== ALL PURCHASE INVOICES ===")
cur.execute("SELECT id, number, supplier_ref, date, subtotal, total, tx_id, tx_type_id FROM purchase_invoices")
p_rows = cur.fetchall()
print(f"Total purchase_invoices: {len(p_rows)}")
for p in p_rows[:30]:
    print(dict(p))

print("\n=== TRANSACTIONS WHERE NUMBER LIKE 'FC%' ===")
cur.execute("SELECT id, number, date, description, tx_type_id, total_debit, total_credit FROM transactions WHERE number LIKE 'FC%' ORDER BY number")
for t in cur.fetchall():
    print(dict(t))
