import sqlite3
import os

db_path = 'empresas/pb_data/auxiliary.db'
if not os.path.exists(db_path):
    print(f"File not found: {db_path}")
else:
    print(f"File size: {os.path.getsize(db_path)} bytes")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [x[0] for x in cur.fetchall()]
    print(f"Total tables: {len(tables)}")
    for t in sorted(tables):
        try:
            cur.execute(f"SELECT COUNT(*) FROM [{t}]")
            cnt = cur.fetchone()[0]
            if cnt > 0:
                print(f"  {t}: {cnt} records")
        except Exception as e:
            print(f"  {t}: Error {e}")
    conn.close()
