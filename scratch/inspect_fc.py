import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

def show_columns(table):
    cur.execute(f"PRAGMA table_info({table})")
    cols = [r['name'] for r in cur.fetchall()]
    print(f"Columns in {table}: {cols}")
    return cols

pinv_cols = show_columns('purchase_invoices')
inv_cols = show_columns('invoices')

cur.execute("SELECT id, number, date, description, tx_type_id FROM transactions WHERE number IN ('FC-00000237', 'FC-00000238', 'FC-00000239')")
fcs = cur.fetchall()
for f in fcs:
    print("\nTX:", dict(f))
    cur.execute("SELECT * FROM purchase_invoices WHERE tx_id = ? OR number = ? OR number = ?", (f['id'], f['number'], f['number'].replace('FC-', '')))
    for p in cur.fetchall():
        print("  Found PI by tx_id/number:", dict(p))

print("\n--- ALL purchase_invoices in Aug 2026 ---")
cur.execute("SELECT id, number, supplier_ref, date, subtotal, total, tx_id, tx_type_id FROM purchase_invoices WHERE date >= '2026-08-01' AND date <= '2026-08-31'")
for p in cur.fetchall():
    print(dict(p))

print("\n--- ALL invoices in Aug 2026 ---")
cur.execute("SELECT id, number, date, subtotal, total, tx_id, tx_type_id FROM invoices WHERE date >= '2026-08-01' AND date <= '2026-08-31'")
for p in cur.fetchall():
    print(dict(p))
