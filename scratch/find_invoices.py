import os
import sqlite3

for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.db'):
            full_path = os.path.join(root, f)
            try:
                con = sqlite3.connect(full_path)
                cur = con.cursor()
                cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_invoices'")
                if cur.fetchone():
                    cur.execute("SELECT count(*) FROM ph_invoices")
                    cnt = cur.fetchone()[0]
                    if cnt > 0:
                        cur.execute("SELECT number, period FROM ph_invoices LIMIT 3")
                        print(f"{full_path}: {cnt} records, sample: {cur.fetchall()}")
            except Exception as e:
                pass
