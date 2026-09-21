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
                    cur.execute("SELECT number, period FROM ph_invoices WHERE number LIKE '%202609%' OR period = '2026-09'")
                    rows = cur.fetchall()
                    if rows:
                        print(f"MATCH in {full_path}: {len(rows)} rows found. First 3: {rows[:3]}")
            except Exception:
                pass
