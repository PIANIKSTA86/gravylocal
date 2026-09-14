import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- BEFORE UPDATE ---")
cur.execute("SELECT id, number, tx_number, tx_id, status, subtotal, total, notes, supplier_ref FROM purchase_invoices WHERE id = '75t0n9f18w0bj6p'")
row = cur.fetchone()
print(dict(row))

print("\n--- UPDATING purchase_invoices for FC-00000239 ---")
cur.execute("""
    UPDATE purchase_invoices 
    SET tx_id = '5wtbxesacba6ojd', tx_number = 'FC-00000239' 
    WHERE id = '75t0n9f18w0bj6p'
""")
con.commit()

print("--- AFTER UPDATE ---")
cur.execute("SELECT id, number, tx_number, tx_id, status, subtotal, total, notes, supplier_ref FROM purchase_invoices WHERE id = '75t0n9f18w0bj6p'")
row = cur.fetchone()
print(dict(row))

print("\n--- VERIFYING ALL PURCHASE INVOICES vs TRANSACTIONS ---")
cur.execute("SELECT id, number, tx_number, tx_id, status FROM purchase_invoices")
for p in cur.fetchall():
    cur.execute("SELECT id, number FROM transactions WHERE id = ?", (p['tx_id'],))
    t = cur.fetchone()
    tx_info = f"TX id={t['id']} num={t['number']}" if t else "TX NOT FOUND"
    print(f"PI id={p['id']} num={p['number']} tx_num={p['tx_number']} status={p['status']} -> {tx_info}")
