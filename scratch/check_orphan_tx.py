import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

tx_id = 'n82n6icffs4swy4'
print("Checking references to", tx_id)
for tname in ['inventory_movements', 'imports', 'purchase_invoices', 'invoices']:
    try:
        cols = [c[1] for c in cur.execute(f"PRAGMA table_info({tname})").fetchall()]
        for c in cols:
            if 'tx' in c:
                rows = cur.execute(f"SELECT id, {c} FROM {tname} WHERE {c} = ?", (tx_id,)).fetchall()
                if rows:
                    print(f"Found in {tname}.{c}:", rows)
    except Exception as e:
        print("Error checking", tname, e)
