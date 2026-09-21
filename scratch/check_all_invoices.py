import os
import sqlite3

for root, dirs, files in os.walk('.'):
    for f in files:
        if f == 'data.db':
            full_path = os.path.join(root, f)
            try:
                con = sqlite3.connect(full_path)
                cur = con.cursor()
                cur.execute("SELECT count(*), max(number), min(number) FROM ph_invoices")
                res = cur.fetchone()
                if res and res[0] > 0:
                    cur.execute("SELECT DISTINCT period FROM ph_invoices")
                    periods = [r[0] for r in cur.fetchall()]
                    print(f"{full_path} -> Count: {res[0]}, Range: {res[2]} to {res[1]}, Periods: {periods}")
            except Exception as e:
                pass
