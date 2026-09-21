import sqlite3
import glob

for db in glob.glob("**/data.db", recursive=True):
    try:
        conn = sqlite3.connect(db)
        cur = conn.cursor()
        cur.execute("SELECT key, value FROM settings WHERE key LIKE '%smtp%' OR key = 'company_name'")
        rows = cur.fetchall()
        if rows:
            print(f"=== {db} ===")
            for k, v in rows:
                if 'pass' in k:
                    print(f"  {k}: [PROTECTED, len={len(v)}]")
                else:
                    print(f"  {k}: {v}")
    except Exception as e:
        pass
