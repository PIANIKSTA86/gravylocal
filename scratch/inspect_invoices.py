import sqlite3
import glob

for db in glob.glob("**/*.db", recursive=True):
    try:
        conn = sqlite3.connect(db)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_invoices'")
        if cur.fetchone():
            print(f"=== FOUND ph_invoices in {db} ===")
            cur.execute("SELECT period, status, COUNT(*) FROM ph_invoices GROUP BY period, status")
            for r in cur.fetchall():
                print(" ", r)
    except Exception as e:
        pass
