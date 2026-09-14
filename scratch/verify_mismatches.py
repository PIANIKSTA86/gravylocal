import sqlite3

con = sqlite3.connect('pb_data/data.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

print("--- CHECKING ALL PURCHASE INVOICES vs TRANSACTIONS ---")
cur.execute("SELECT id, number, tx_number, tx_id, status, subtotal, total FROM purchase_invoices")
for p in cur.fetchall():
    t_by_id = None
    t_by_num = None
    if p['tx_id']:
        cur.execute("SELECT id, number, description FROM transactions WHERE id = ?", (p['tx_id'],))
        t_by_id = cur.fetchone()
    cur.execute("SELECT id, number, description FROM transactions WHERE number = ? OR number = ?", (p['number'], p['tx_number']))
    t_by_num = cur.fetchone()
    
    print(f"PI: id={p['id']}, num={p['number']}, tx_num={p['tx_number']}, tx_id={p['tx_id']}, status={p['status']}")
    if t_by_id:
        print(f"   -> TX by tx_id: id={t_by_id['id']}, num={t_by_id['number']}")
    else:
        print(f"   -> TX by tx_id: NOT FOUND")
    if t_by_num:
        print(f"   -> TX by num:   id={t_by_num['id']}, num={t_by_num['number']}")
    if t_by_id and t_by_num and t_by_id['id'] != t_by_num['id']:
        print(f"   *** MISMATCH DETECTED! ***")
